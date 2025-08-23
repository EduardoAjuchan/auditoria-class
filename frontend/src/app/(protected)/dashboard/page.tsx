'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import CreateVehicleModal from '@/components/vehicles/CreateVehicleModal';
import { Eye, Pencil, Power, PowerOff } from 'lucide-react';

// Tipo local de vehículo para esta página
interface Vehicle {
  id: number;
  brand: string;
  model: string;
  plate: string;
  yearMade: number;
  price: number;
  status: string;
  mileageKm: number;
  color: string | null | undefined;
  createdAt: string;
  isActive: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050';

export default function DashboardPage() {
  const router = useRouter();

  // sesión
  const [token, setToken] = useState<string | null>(null);

  // modal crear
  const [openCreate, setOpenCreate] = useState(false);

  // estado de tabla
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  // filtros básicos (listos para usarse cuando los agreguemos)
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const includeInactive = 0;

  function normalizeVehicle(raw: any): Vehicle {
    return {
      id: raw.vehicleId ?? raw.id,
      brand: raw.brand,
      model: raw.model,
      plate: raw.plate,
      yearMade: raw.yearMade ?? raw.year_made,
      price: raw.price,
      status: raw.status,
      mileageKm: raw.mileageKm ?? raw.mileage_km,
      color: raw.color ?? null,
      isActive: typeof raw.isActive === 'boolean' ? raw.isActive : raw.is_active !== 0,
      createdAt: raw.createdAt ?? raw.created_at,
    } as Vehicle;
  }

  async function fetchVehicles() {
    setLoadingVehicles(true);
    try {
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!t) throw new Error('Sesión no válida');

      const params = new URLSearchParams();
      params.set('brand', brand);
      params.set('status', status);
      params.set('yearFrom', yearFrom);
      params.set('yearTo', yearTo);
      params.set('includeInactive', String(includeInactive));
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`${API_BASE}/api/vehicles?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${t}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || `HTTP ${res.status}`);

      const list: any[] = Array.isArray(data?.data) ? data.data : data?.data ? [data.data] : [];
      setItems(list.map(normalizeVehicle));
      setTotal(Number(data?.total ?? list.length) || 0);
    } catch (e) {
      console.error('fetchVehicles:', e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoadingVehicles(false);
    }
  }

  async function postVehicleAction(id: number, action: 'disable' | 'enable') {
    try {
      setActionLoadingId(id);
      const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!t) throw new Error('Sesión no válida');

      const res = await fetch(`${API_BASE}/api/vehicles/${id}/${action}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${t}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || `HTTP ${res.status}`);

      // actualizar estado local sin refetch completo
      setItems(prev => prev.map(v => v.id === id ? { ...v, isActive: action === 'enable' } : v));
    } catch (e: any) {
      console.error(`vehicles/${id}/${action}`, e);
      alert(e?.message || `No se pudo ${action === 'disable' ? 'deshabilitar' : 'habilitar'} el vehículo`);
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleDisable(v: Vehicle) {
    // opcional: confirmación rápida
    if (!confirm(`Deshabilitar el vehículo ${v.brand} ${v.model} (ID ${v.id})?`)) return;
    postVehicleAction(v.id, 'disable');
  }

  function handleEnable(v: Vehicle) {
    if (!confirm(`Habilitar el vehículo ${v.brand} ${v.model} (ID ${v.id})?`)) return;
    postVehicleAction(v.id, 'enable');
  }

  // verificar sesión y primer fetch
  useEffect(() => {
    let t: string | null = null;
    try { t = localStorage.getItem('token'); } catch {}
    setToken(t);
    if (!t) {
      router.replace('/');
    } else {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // refetch ante cambios de filtros/paginación
  useEffect(() => {
    if (token) fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, brand, status, yearFrom, yearTo]);

  if (!token) return null;

  return (
    <main className="min-h-screen">
      <NavBar />

      <section className="max-w-7xl mx-auto p-6">
        {/* Encabezado simple */}
        <div className="rounded-2xl bg-white/90 dark:bg-zinc-900/70 shadow-xl ring-1 ring-black/5 backdrop-blur p-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Vehículos</h1>
        </div>

        {/* Toolbar y tabla */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inventario de Vehículos</h2>
            <button
              onClick={() => { setEditVehicle(null); setOpenCreate(true); }}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Crear vehículo
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl shadow ring-1 ring-black/5">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Marca</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Modelo</th>
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Año</th>
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Precio</th>
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Estado</th>
                  <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Activo</th>
                  <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Km</th>
                  <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Color</th>
                  <th className="hidden xl:table-cell px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Creado</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {loadingVehicles && (
                  <tr>
                    <td colSpan={10} className="px-3 py-6 text-center text-zinc-500">Cargando vehículos…</td>
                  </tr>
                )}

                {!loadingVehicles && items.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-10 text-center text-zinc-500">No hay vehículos para mostrar.</td>
                  </tr>
                )}

                {!loadingVehicles && items.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-3 py-2 font-medium">{v.brand}</td>
                    <td className="px-3 py-2">{v.model}</td>
                    <td className="hidden sm:table-cell px-3 py-2">{v.yearMade}</td>
                    <td className="hidden sm:table-cell px-3 py-2">{formatCurrency(v.price)}</td>
                    <td className="hidden sm:table-cell px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass(v.status)}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${activeBadgeClass(v.isActive)}`}>
                        {v.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-2">{formatNumber(v.mileageKm)} km</td>
                    <td className="hidden lg:table-cell px-3 py-2">{v.color ?? '-'}</td>
                    <td className="hidden xl:table-cell px-3 py-2">{formatDate(v.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        
                        <IconButton title="Editar" onClick={() => { setEditVehicle(v); setOpenCreate(true); }}>
                          <Pencil className="w-4 h-4" />
                        </IconButton>
                        {v.isActive ? (
                          <IconButton title="Desactivar" onClick={() => handleDisable(v)} disabled={actionLoadingId === v.id}>
                            <PowerOff className="w-4 h-4" />
                          </IconButton>
                        ) : (
                          <IconButton title="Habilitar" onClick={() => handleEnable(v)} disabled={actionLoadingId === v.id}>
                            <Power className="w-4 h-4" />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* paginación simple */}
          <div className="flex items-center justify-between mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Total: {total}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg px-3 py-1 ring-1 ring-zinc-300 dark:ring-zinc-700 disabled:opacity-50"
              >
                Anterior
              </button>
              <span>Página {page}</span>
              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg px-3 py-1 ring-1 ring-zinc-300 dark:ring-zinc-700 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <CreateVehicleModal
          open={openCreate}
          onClose={() => { setOpenCreate(false); setEditVehicle(null); }}
          onSuccess={() => {
            setOpenCreate(false);
            setEditVehicle(null);
            setPage(1);
            fetchVehicles();
          }}
          mode={editVehicle ? 'edit' : 'create'}
          vehicleId={editVehicle?.id}
          initial={editVehicle ? {
            plate: editVehicle.plate,
            price: editVehicle.price,
            status: editVehicle.status,
          } : undefined}
        />
      </section>
    </main>
  );
}

function formatCurrency(n?: number) {
  if (typeof n !== 'number') return '—';
  try {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(n);
  } catch {
    return n.toLocaleString('es-GT');
  }
}

function formatNumber(n?: number) {
  if (typeof n !== 'number') return '—';
  try {
    return new Intl.NumberFormat('es-GT').format(n);
  } catch {
    return String(n);
  }
}

function formatDate(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.valueOf())) return s;
  return d.toLocaleDateString('es-GT', { year: '2-digit', month: '2-digit', day: '2-digit' });
}

function badgeClass(status: string) {
  const s = status?.toUpperCase?.();
  if (s === 'DISPONIBLE') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (s === 'VENDIDO') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (s === 'MANTENIMIENTO') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
}

function activeBadgeClass(isActive: boolean) {
  return isActive
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

function IconButton({ title, onClick, children, disabled }: { title: string; onClick?: () => void; children: React.ReactNode; disabled?: boolean; }) {
  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
}