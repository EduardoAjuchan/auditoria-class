'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // para refrescar la tabla al crear/editar
  mode?: Mode;            // 'create' (default) | 'edit'
  vehicleId?: number;     // requerido en edit
  // valores iniciales opcionales para precargar (especialmente en edit)
  initial?: Partial<Form>;
};

// Form completo (create) y también base para edit
export type Form = {
  brand: string;
  model: string;
  plate: string;
  yearMade: number | '';// number en envío, string para input
  price: number | '';
  status: 'DISPONIBLE' | 'VENDIDO' | string;
  mileageKm: number | '';
  color: string;
};

const initialForm: Form = {
  brand: '',
  model: '',
  plate: '',
  yearMade: '',
  price: '',
  status: 'DISPONIBLE',
  mileageKm: '',
  color: '',
};

const STATUSES = ['DISPONIBLE', 'VENDIDO'] as const;

export default function CreateVehicleModal({ open, onClose, onSuccess, mode = 'create', vehicleId, initial }: Props) {
  const isEdit = mode === 'edit';

  const seed = useMemo<Form>(() => ({
    ...initialForm,
    ...initial,
    status: (initial?.status ?? 'DISPONIBLE') as Form['status'],
  }), [initial]);

  const [form, setForm] = useState<Form>(seed);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (open) {
      setForm(seed);
      setMsg(null);
      setStatusMsg('info');
    }
  }, [open, seed]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Validación placa simple
  const plateError = useMemo(() => {
    const p = (form.plate ?? '').toString().trim().toUpperCase();
    if (!p) return null;
    if (!/^[A-Z0-9-]{6,8}$/.test(p)) return 'Formato de placa inválido';
    return null;
  }, [form.plate]);

  // Validaciones según modo
  const canSubmit = useMemo(() => {
    if (isEdit) {
      // Solo status, price y plate
      return (
        !!form.plate && form.price !== '' && !!form.status && !plateError
      );
    }
    // create
    return (
      !!form.brand && !!form.model && !!form.plate && !!form.status &&
      form.yearMade !== '' && form.price !== '' && form.mileageKm !== '' &&
      !plateError
    );
  }, [isEdit, form, plateError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setMsg(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Sesión no válida. Iniciá sesión de nuevo.');

      if (!isEdit) {
        // CREATE -> POST /api/vehicles (status fijo DISPONIBLE)
        const payload = {
          brand: form.brand.trim(),
          model: form.model.trim(),
          plate: form.plate.trim().toUpperCase(),
          yearMade: Number(form.yearMade),
          price: Number(form.price),
          status: 'DISPONIBLE',
          mileageKm: Number(form.mileageKm),
          color: form.color.trim() || undefined,
        };

        const res = await fetch(`${API_BASE}/api/vehicles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) throw new Error(data?.message || `HTTP ${res.status}`);

        setStatusMsg('success');
        setMsg('Vehículo creado correctamente');
        setForm(initialForm);
      } else {
        // EDIT -> PATCH /api/vehicles/:id
        if (!vehicleId) throw new Error('ID de vehículo faltante para edición.');

        const diff: any = {};
        // Solo permitidos: status, price, plate
        if (typeof form.status === 'string') diff.status = form.status.toUpperCase();
        if (form.price !== '') diff.price = Number(form.price);
        if (form.plate) diff.plate = form.plate.trim().toUpperCase();

        const res = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(diff),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) throw new Error(data?.message || `HTTP ${res.status}`);

        setStatusMsg('success');
        setMsg('Vehículo actualizado');
      }

      // cerrar y notificar
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 400);
    } catch (err: any) {
      setStatusMsg('error');
      setMsg(err?.message || (isEdit ? 'Error al actualizar el vehículo' : 'Error al crear el vehículo'));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar vehículo' : 'Nuevo vehículo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos según modo */}
        {!isEdit ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Marca</label>
              <input
                value={form.brand}
                onChange={e => set('brand', e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="Toyota"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Modelo</label>
              <input
                value={form.model}
                onChange={e => set('model', e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="Corolla"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Placa</label>
              <input
                value={form.plate}
                onChange={e => set('plate', e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 uppercase"
                placeholder="P123ABC"
                required
              />
              {plateError && <p className="mt-1 text-xs text-red-500">{plateError}</p>}
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Año</label>
              <input
                type="number"
                value={form.yearMade}
                onChange={e => set('yearMade', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="2021"
                required
                min={1950}
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Precio</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="120000"
                required
                min={0}
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Kilometraje (Km)</label>
              <input
                type="number"
                value={form.mileageKm}
                onChange={e => set('mileageKm', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="15000"
                required
                min={0}
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
              <input
                type="text"
                value="DISPONIBLE"
                readOnly
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Color</label>
              <input
                value={form.color}
                onChange={e => set('color', e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="Gris"
              />
            </div>
          </div>
        ) : (
          // EDIT MODE: solo Status (dropdown), Precio y Placa
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
              <select
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Precio</label>
              <input
                type="number"
                value={form.price}
                onChange={e => set('price', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                placeholder="115000"
                required
                min={0}
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">Placa</label>
              <input
                value={form.plate}
                onChange={e => set('plate', e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 uppercase"
                placeholder="P123XYZ"
                required
              />
              {plateError && <p className="mt-1 text-xs text-red-500">{plateError}</p>}
            </div>
          </div>
        )}

        {msg && <Alert type={statusMsg} message={msg} />}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (isEdit ? 'Guardando…' : 'Creando…') : (isEdit ? 'Guardar cambios' : 'Crear vehículo')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}