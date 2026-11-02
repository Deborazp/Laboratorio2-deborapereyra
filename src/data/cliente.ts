export class Cliente {
  constructor(
    public id: string,
    public nombreCompleto: string,
    public Direccion: string,
    public dni: string,
  ) {}
}

export type ClienteAtributo = 'nombreCompleto' | 'Direccion' | 'dni';

export interface ClienteEav {
  clienteId: string;
  atributo: ClienteAtributo;
  valor: string;
}

export const tablaClientesEav: ClienteEav[] = [
  { clienteId: 'client-001', atributo: 'nombreCompleto', valor: 'Emanuel Lafuria' },
  { clienteId: 'client-001', atributo: 'Direccion', valor: 'Belgrano 740 , Barrio centro' },
  { clienteId: 'client-001', atributo: 'dni', valor: '39.184.327' },
  { clienteId: 'client-002', atributo: 'nombreCompleto', valor: 'Joaquin Fernandez' },
  { clienteId: 'client-002', atributo: 'Direccion', valor: 'Quintana 707, Centro' },
  { clienteId: 'client-002', atributo: 'dni', valor: '30.596.410' },
  { clienteId: 'client-003', atributo: 'nombreCompleto', valor: 'Lucas Adan Pereyra' },
  { clienteId: 'client-003', atributo: 'Direccion', valor: 'General guemes 626, San Martín' },
  { clienteId: 'client-003', atributo: 'dni', valor: '14.038.651' },
  { clienteId: 'client-004', atributo: 'nombreCompleto', valor: 'Silvana Torralba' },
  { clienteId: 'client-004', atributo: 'Direccion', valor: 'Sarmiento 102, Malvinas Argentinas' },
  { clienteId: 'client-004', atributo: 'dni', valor: '18.742.903' },
  { clienteId: 'client-005', atributo: 'nombreCompleto', valor: 'Sebastian Villegas' },
  { clienteId: 'client-005', atributo: 'Direccion', valor: 'Mitre 311, Barrio Jardon' },
  { clienteId: 'client-005', atributo: 'dni', valor: '35.461.275' },
];

const obtenerValorCliente = (
  clienteId: string,
  atributo: ClienteAtributo,
) => tablaClientesEav.find(  (fila) => 
  fila.clienteId === clienteId && fila.atributo === atributo,
)?.valor ?? '';

export const clientes: Cliente[] = Array.from(  new Set(tablaClientesEav.map((fila) => fila.clienteId)),
).map((id) => 
  new Cliente(  id,  obtenerValorCliente(id, 'nombreCompleto'),
  obtenerValorCliente(id, 'Direccion'),
  obtenerValorCliente(id, 'dni'),
));