'use client';

import { useMemo } from 'react';
import { Pencil, Power, PowerOff, Eye } from 'lucide-react';

export type Vehicle = {
  id: number;
  brand: string;
  model: string;
  yearMade: number;
  price: number;
  status: 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO' | string;
  mileageKm: number;
  color?: string | null;
  createdAt?: string;
  isActive?: boolean;
};

type Props = {
  items: Vehicle[];
  loading?: boolean;
  onEdit?: (v: Vehicle) => void;
  onDisable?: (v: Vehicle) => void;
  onEnable?: (v: Vehicle) => void;
  onView?: (v: Vehicle) => void;
  onCreate?: () => void;
};

export default function VehiclesTable({
  items,
  loading = false,
  onEdit,
  onDisable,
  onEnable,
  onView,
  onCreate,
}: Props) {
  const hasRows = items && items.length > 0;

  const headers = useMemo(
    () => [
      { key: 'brand', label: 'Marca' },
      { key: 'model', label: 'Modelo' },
      { key: 'yearMade', label: 'Año' },
      { key: 'price', label: 'Precio' },
      { key: 'status', label: 'Estado' },
      { key: 'mileageKm', label: 'Km' },
      { key: 'color', label: 'Color' },
      { key: 'createdAt', label: 'Creado' },
      { key: 'actions', label: 'Acciones' },
    ],
    []
  );

  return (
    <div className="w-full rounded-2xl bg-white/90 dark:bg-zinc-900/70 shadow-xl ring-1 ring-black/5 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold tracking-tight">Inventario</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Nuevo vehículo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              {headers.map(h => (
                <th key={h.key} className="px-4 py-3 whitespace-nowrap">{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-zinc-500">
                  Cargando vehículos…
                </td>
              </tr>
            )}

            {!loading && !hasRows && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-zinc-500">
                  No hay vehículos para mostrar.
                </td>
              </tr>
            )}

            {!loading && hasRows && items.map(v => (
              <tr
                key={v.id}
                className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
              >
                <td className="px-4 py-3 font-medium">{v.brand}</td>
                <td className="px-4 py-3">{v.model}</td>
                <td className="px-4 py-3">{v.yearMade}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(v.price)}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 tabular-nums">{formatNumber(v.mileageKm)} km</td>
                <td className="px-4 py-3">{v.color || '—'}</td>
                <td className="px-4 py-3">{formatDate(v.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <IconButton title="Ver" onClick={() => onView?.(v)}>
                      <Eye className="w-4 h-4" />
                    </IconButton>
                    <IconButton title="Editar" onClick={() => onEdit?.(v)}>
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                    {v.isActive !== false ? (
                      <IconButton title="Desactivar" onClick={() => onDisable?.(v)}>
                        <PowerOff className="w-4 h-4" />
                      </IconButton>
                    ) : (
                      <IconButton title="Habilitar" onClick={() => onEnable?.(v)}>
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
    </div>
  );
}

function IconButton({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode; }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 ring-1 ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase?.() || '—';
  const styles =
    s === 'DISPONIBLE'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : s === 'VENDIDO'
      ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200'
      : s === 'RESERVADO'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

  return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles}`}>{s}</span>;
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