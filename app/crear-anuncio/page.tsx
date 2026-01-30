'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { spanishCities, activityOptions } from '@/data/mockProfiles';

const PROFILE_PREFILL_SELECT =
  'name,phone,whatsapp,city,zone,postal_code,age,languages,available_days,accompaniment_types,schedule,hair_color,height_cm,weight_kg,profession,nationality,birth_place,description,status' as const;

const IDIOMAS = [
  'Español',
  'Catalán',
  'Inglés',
  'Alemán',
  'Portugués',
  'Italiano',
  'Francés',
  'Ruso',
  'Oriental',
] as const;

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export default function CrearAnuncioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // Datos básicos
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(false);
  const [description, setDescription] = useState('');

  // Ubicación
  const [city, setCity] = useState('Madrid');
  const [zone, setZone] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Información personal
  const [age, setAge] = useState<string>('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [accompanimentTypes, setAccompanimentTypes] = useState<string[]>([]);
  const [accompanimentDisclaimerAccepted, setAccompanimentDisclaimerAccepted] = useState(false);

  // Disponibilidad
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');

  // Características físicas
  const [hairColor, setHairColor] = useState('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');

  // Información adicional
  const [profession, setProfession] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const isPhoneValid = useMemo(() => /^\d{9}$/.test(phone), [phone]);
  const isPostalValid = useMemo(() => postalCode === '' || /^\d{5}$/.test(postalCode), [postalCode]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?next=/crear-anuncio');
    }
  }, [loading, user, router]);

  // Prefill if profile exists
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setPrefillLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_PREFILL_SELECT)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Si la tabla no existe o RLS bloquea, lo veremos aquí
        toast({
          title: 'No se pudo leer tu perfil',
          description: error.message,
          variant: 'destructive',
        });
        setPrefillLoading(false);
        return;
      }

      if (data) {
        setExistingStatus((data as any).status ?? null);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setWhatsapp(Boolean(data.whatsapp));
        setCity(data.city ?? 'Madrid');
        setZone(data.zone ?? '');
        setPostalCode(data.postal_code ?? '');
        setAge(data.age != null ? String(data.age) : '');
        setLanguages((data.languages ?? []) as string[]);
        setAvailableDays((data.available_days ?? []) as string[]);
        setAccompanimentTypes((data.accompaniment_types ?? []) as string[]);
        setSchedule(data.schedule ?? '');
        setHairColor(data.hair_color ?? '');
        setHeightCm(data.height_cm != null ? String(data.height_cm) : '');
        setWeightKg(data.weight_kg != null ? String(data.weight_kg) : '');
        setProfession(data.profession ?? '');
        setNationality(data.nationality ?? '');
        setBirthPlace(data.birth_place ?? '');
        setDescription(data.description ?? '');
      }

      setPrefillLoading(false);
    };

    run();
  }, [user, toast]);

  const toggleInArray = (arr: string[], value: string) => {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast({ title: 'Nombre obligatorio', description: 'Indica tu nombre o alias.', variant: 'destructive' });
      return;
    }

    if (!isPhoneValid) {
      toast({
        title: 'Teléfono inválido',
        description: 'Introduce solo números, 9 dígitos (sin espacios).',
        variant: 'destructive',
      });
      return;
    }

    if (!city || city.trim() === '') {
      toast({ title: 'Ciudad obligatoria', description: 'Selecciona una ciudad.', variant: 'destructive' });
      return;
    }

    if (!isPostalValid) {
      toast({
        title: 'Código postal inválido',
        description: 'Debe tener 5 dígitos (o dejarse vacío).',
        variant: 'destructive',
      });
      return;
    }

    if (!accompanimentDisclaimerAccepted) {
      toast({
        title: 'Confirmación obligatoria',
        description:
          'Debes marcar el aviso de “Tipo de acompañamiento” para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      phone,
      whatsapp,
      city,
      zone: zone.trim() || null,
      postal_code: postalCode.trim() || null,
      age: age ? Number(age) : null,
      languages,
      available_days: availableDays,
      accompaniment_types: accompanimentTypes,
      schedule: schedule.trim() || null,
      hair_color: hairColor.trim() || null,
      height_cm: heightCm ? Number(heightCm) : null,
      weight_kg: weightKg ? Number(weightKg) : null,
      profession: profession.trim() || null,
      nationality: nationality.trim() || null,
      birth_place: birthPlace.trim() || null,
      // Importante: no degradar el estado al editar.
      // Si el anuncio ya estaba aprobado/rechazado/suspendido, se mantiene.
      // Si no existe aún, entra como pendiente.
      status: existingStatus ?? 'pending',
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      toast({
        title: 'No se pudo guardar tu anuncio',
        description: error.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    toast({
      title: 'Anuncio guardado',
      description:
        (existingStatus ?? 'pending') === 'approved'
          ? 'Tu anuncio se ha actualizado y sigue publicado.'
          : 'Tu anuncio queda pendiente de revisión para su activación.',
    });
    setSaving(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-2xl gradient-text">
              Crear anuncio – Información del perfil
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Completa el siguiente formulario para publicar tu anuncio en la plataforma. Los datos que indiques formarán
              parte de tu perfil público, visible para los visitantes. Los campos obligatorios deben completarse para poder
              activar el anuncio.
            </p>
          </CardHeader>
          <CardContent>
            {prefillLoading && user ? (
              <p className="text-sm text-muted-foreground">Cargando tu perfil…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Datos básicos */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Datos básicos</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre o alias"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (OBLIGATORIO)</Label>
                    <Input
                      id="phone"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="9 dígitos, sin espacios"
                      required
                    />
                    {!isPhoneValid && phone.length > 0 && (
                      <p className="text-xs text-destructive">Debe tener exactamente 9 dígitos.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="whatsapp"
                      checked={whatsapp}
                      onCheckedChange={(v) => setWhatsapp(Boolean(v))}
                    />
                    <Label htmlFor="whatsapp">WhatsApp (también atiendo por WhatsApp)</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe tu anuncio (servicios, estilo, condiciones, etc.)"
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Consejo: escribe una descripción clara y profesional. Evita datos sensibles.
                    </p>
                  </div>
                </section>

                {/* Ubicación */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Ubicación</h3>

                  <div className="space-y-2">
                    <Label>Ciudad (OBLIGATORIO)</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecciona una ciudad" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-72">
                        {spanishCities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone">Zona</Label>
                    <Input
                      id="zone"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      placeholder="Zona, barrio o distrito"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal">Código postal</Label>
                    <Input
                      id="postal"
                      inputMode="numeric"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="Opcional"
                    />
                    {!isPostalValid && (
                      <p className="text-xs text-destructive">Debe tener 5 dígitos (o dejarse vacío).</p>
                    )}
                  </div>
                </section>

                {/* Información personal */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Información personal</h3>

                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="Años"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Idiomas</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {IDIOMAS.map((lang) => (
                        <label key={lang} className="flex items-center gap-2 text-sm text-foreground">
                          <Checkbox
                            checked={languages.includes(lang)}
                            onCheckedChange={() => setLanguages((prev) => toggleInArray(prev, lang))}
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Actividades / intereses</Label>
                    <p className="text-xs text-muted-foreground">
                      Selecciona una o varias opciones (se mostrarán en tu anuncio).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activityOptions.map((t) => (
                        <label key={t.id} className="flex items-center gap-2 text-sm text-foreground">
                          <Checkbox
                            checked={accompanimentTypes.includes(t.id)}
                            onCheckedChange={() => setAccompanimentTypes((prev) => toggleInArray(prev, t.id))}
                          />
                          <span className="text-muted-foreground">{t.icon}</span>
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 space-y-3">
                    <div className="font-semibold text-foreground">
                      Importante — Lectura obligatoria
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Las opciones mostradas no implican servicios sexuales ni encuentros íntimos.</span>{' '}
                      La plataforma no permite ni facilita servicios de carácter sexual.
                    </p>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="accompaniment_disclaimer"
                        checked={accompanimentDisclaimerAccepted}
                        onCheckedChange={(v) => setAccompanimentDisclaimerAccepted(Boolean(v))}
                      />
                      <Label htmlFor="accompaniment_disclaimer" className="text-sm leading-snug">
                        He leído y entiendo este aviso y confirmo que mi anuncio cumple las normas.
                      </Label>
                    </div>
                    {!accompanimentDisclaimerAccepted ? (
                      <p className="text-xs text-muted-foreground">
                        Debes marcar esta casilla para poder guardar el anuncio.
                      </p>
                    ) : null}
                  </div>
                </section>

                {/* Disponibilidad */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Disponibilidad</h3>

                  <div className="space-y-2">
                    <Label>Días disponibles</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DIAS.map((day) => (
                        <label key={day} className="flex items-center gap-2 text-sm text-foreground">
                          <Checkbox
                            checked={availableDays.includes(day)}
                            onCheckedChange={() => setAvailableDays((prev) => toggleInArray(prev, day))}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule">Horario</Label>
                    <Input
                      id="schedule"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="Ej: 10:00 – 22:00"
                    />
                  </div>
                </section>

                {/* Características físicas */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Características físicas</h3>

                  <div className="space-y-2">
                    <Label htmlFor="hair">Color de pelo</Label>
                    <Input
                      id="hair"
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      placeholder="Ej: Rubio, Morena…"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        inputMode="numeric"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="Ej: 170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        inputMode="numeric"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="Ej: 60"
                      />
                    </div>
                  </div>
                </section>

                {/* Información adicional */}
                <section className="space-y-4">
                  <h3 className="font-display text-xl font-semibold">Información adicional</h3>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profesión</Label>
                    <Input
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Actividad o profesión principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nacionalidad</Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Tu nacionalidad"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth">¿Dónde has nacido?</Label>
                    <Input
                      id="birth"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="País o ciudad de nacimiento"
                    />
                  </div>
                </section>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={saving || !accompanimentDisclaimerAccepted}
                >
                  {saving ? 'Guardando…' : 'Guardar anuncio'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

