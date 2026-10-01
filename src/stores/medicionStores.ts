import { create } from 'zustand';

export type TipoServicio = 'Agua' | 'Luz';

export type Medicion = {
  id: string;
  clientId: string;
  servicio: TipoServicio;
  value: number;
  observacion: string;
  fecha: string;
};

type MedicionStore = {
  mediciones: Medicion[];
  addMedicion: (
    medicion: Omit<Medicion, 'id' | 'recordedAt'>,
  ) => void;
  actualizarMedicion: (
    id: string,
    changes: Omit<Medicion, 'id' | 'recordedAt'>,
  ) => void;
};

export const useMedicionStore = create<MedicionStore>((set) => ({
  mediciones: [],
  addMedicion: (medicion) =>
    set((state) => ({
      mediciones: [{
        ...medicion,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fecha: new Date().toISOString(),
      },
      ...state.mediciones,
      ],
    })),






  actualizarMedicion: (id, changes) =>
    set((state) => ({
      mediciones: state.mediciones.map((medicion) =>
        medicion.id === id ? { ...medicion, ...changes } : medicion,
      ),
    })),
}));