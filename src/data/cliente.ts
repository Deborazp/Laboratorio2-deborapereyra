export type Cliente = {
  id: string;
  nombreCompleto: string;
  Direccion: string;
  dni: string;
};

export const clientes: Cliente[] = [
  {
    id: 'client-001',
    nombreCompleto: 'Emanuel Lafuria ',
    Direccion: 'Belgrano 740 , Barrio centro',
    dni: '39.184.327',
  },
  {
    id: 'client-002',
    nombreCompleto: 'Joaquin Fernandez',
    Direccion: 'Quintana 707, Centro',
    dni: '30.596.410',
  },
  {
    id: 'client-003',
    nombreCompleto: 'Lucas Adan Pereyra',
    Direccion: 'General guemes 626, San Martín',
    dni: '14.038.651',
  },
  {
    id: 'client-004',
    nombreCompleto: 'Silvana Torralba',
    Direccion: 'Sarmiento 102, Malvinas Argentinas',
    dni: '18.742.903',
  },
  {
    id: 'client-005',
    nombreCompleto: 'Sebastian Villegas',
    Direccion: 'Mitre 311, Barrio Jardon',
    dni: '35.461.275',
  },
];