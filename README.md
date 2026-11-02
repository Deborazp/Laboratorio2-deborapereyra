# Proyecto: COSPRAL

## Descripción

COSPRAL es un sistema de administración para una cooperativa, desarrollado como proyecto de tesis. El sistema cuenta con una plataforma web utilizada por el área administrativa y una aplicación móvil destinada a los técnicos encargados de registrar las mediciones de los servicios de luz y agua.

La aplicación móvil permite registrar, consultar, visualizar y modificar las mediciones realizadas en campo.


## Integrante

Débora Zulema Pereyra

## Features implementadas

- Registro de mediciones.
- Consulta de mediciones mediante filtros por cliente o fecha.
- Visualización de mediciones registradas.
- Modificación de mediciones.
- Registro del motivo cuando una medición no puede realizarse.
-  Posibilidad de adjuntar una foto del medidor junto con la medición.(uso de cámara y galeria)
- Posibilidad de adjuntar una foto cuando el medidor presente una falla, rotura o posible adulteración.(uso de cámara y galeria)
- Registro de motivos de rechazo o imposibilidad de medición.

## Features pendientes

- Asignación de mediciones a un técnico específico.
- Visualización de las mediciones asignadas al técnico.


## Testing 

Se diseña un caso de prueba para verificar que una medición se registre correctamente en la aplicación. Para ello, se utiliza React Native Testing Library, mediante getBy para localizar los elementos de la pantalla y fireEvent para simular las acciones del usuario, como completar los campos y presionar el botón de guardar.

Finalmente, se comprueba que la medición se haya registrado correctamente.

