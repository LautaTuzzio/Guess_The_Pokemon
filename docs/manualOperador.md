# Manual del Operador - PokeGuesser

## 1. Introducción

### Objetivo del manual
Este manual tiene como objetivo proporcionar a los operadores y administradores de la plataforma PokeGuesser toda la información necesaria para gestionar, mantener y solucionar problemas en el sistema. Incluye instrucciones detalladas sobre la configuración, monitoreo y administración de la aplicación.

### Descripción general de la página web
Poké Guesser es un juego web interactivo basado en la franquicia Pokémon donde los jugadores deben adivinar un Pokémon secreto utilizando pistas y comparando características. El juego ofrece dos modos:
- Modo Un Solo Jugador: Los jugadores compiten contra sí mismos para adivinar el Pokémon.
- Modo Multijugador: Los jugadores compiten entre sí en salas para adivinar el Pokémon más rápido.

El juego utiliza la PokeAPI para obtener datos actualizados de los Pokémon.

## 2. Requisitos del sistema

### Requisitos de hardware
- Servidor: Cualquier servidor capaz de ejecutar Node.js (mínimo 1GB RAM, 1 CPU)
- Almacenamiento: Mínimo 500MB para la aplicación y dependencias
- Ancho de banda: Suficiente para manejar el tráfico esperado (recomendado mínimo 10Mbps)

### Requisitos de software
- Navegador recomendado: Chrome, Firefox, Safari, Edge (versiones actualizadas)
- Conexión a Internet: Requerida para acceder a la PokeAPI
- Servidor: Node.js (versión compatible con Express 4.18.2 y Socket.io 4.7.2)
- Dependencias principales: Express, Socket.io, UUID (ver package.json para versiones específicas)

### Accesos necesarios
- Acceso SSH al servidor para despliegue y mantenimiento
- Credenciales de administrador para el panel de control Webmin

## 3. Acceso al sistema

### Proceso de inicio de sesión como operador/administrador
1. Acceda a la URL del panel de Webmin https://edusoftware.net.ar/:10000/
2. Ingrese su nombre de usuario y contraseña proporcionados
3. Accederá al panel de control principal de Webmin

## 4. Navegación por la interfaz de administración (Webmin)

### Descripción del panel principal
El panel principal de Webmin muestra:
- Información del sistema (carga del servidor, uso de memoria, espacio en disco)
- Alertas del sistema (errores, problemas de rendimiento)
- Accesos directos a los módulos más utilizados

### Menús y secciones disponibles en Webmin
- **Sistema**: Configuración del servidor, usuarios, programación de tareas
- **Servidores**: Gestión de servicios web, bases de datos
- **Red**: Configuración de red, cortafuegos, enrutamiento
- **Hardware**: Particiones de disco, configuración de hardware
- **Otros**: Módulos adicionales, personalización de Webmin
- **Webmin**: Configuración del propio Webmin, usuarios, módulos

### Gestión de Poké Guesser en Webmin
- **Servidor Node.js**: Gestión del servidor de juego, reinicio del servicio, visualización de logs
- **Archivos de configuración**: Edición de los archivos de la aplicación

## 5. Gestión de archivos y configuración en Webmin

### Edición de archivos de configuración
1. Acceda a "Otros" > "Editor de archivos"
2. Navegue hasta el directorio de instalación de la aplicación
3. Seleccione el archivo que desea editar
4. Realice los cambios necesarios y guarde el archivo

### Gestión de traducciones mediante archivos
1. Acceda a "Otros" > "Editor de archivos"
2. Navegue hasta el directorio `src` de la aplicación
3. Edite el archivo `translate.js` que contiene las traducciones
4. Modifique los textos según sea necesario y guarde el archivo
5. Reinicie el servicio de la aplicación desde "Sistema" > "Servicios de arranque"

[NOTA: La ruta exacta de instalación dependerá de la configuración del servidor. La aplicación utiliza un archivo translate.js para las traducciones en lugar de archivos JSON separados]

## 6. Monitoreo del sistema en Webmin

### Visualización de estadísticas del sistema
- Acceda a "Sistema" > "Información del sistema" para ver el estado general
- Utilice "Otros" > "Estado del sistema" para monitorear recursos en tiempo real
- Consulte "Hardware" > "Uso de disco" para verificar el espacio disponible

### Gestión de logs en Webmin
1. Acceda a "Sistema" > "Registro del sistema"
2. Seleccione el tipo de log que desea visualizar (syslog, auth.log, application.log)
3. Utilice los filtros disponibles para buscar eventos específicos
4. Exporte los logs mediante la opción "Guardar" para análisis detallado

### Configuración de alertas y notificaciones
1. Acceda a "Webmin" > "Configuración de Webmin"
2. Seleccione "Alertas por correo"
3. Configure los umbrales para uso de CPU, memoria, espacio en disco
4. Establezca la dirección de correo para recibir las notificaciones

## 7. Mantenimiento del sistema en Webmin

### Actualización del sistema operativo
1. Acceda a "Sistema" > "Actualización de paquetes"
2. Haga clic en "Actualizar paquetes instalados" para actualizar el sistema operativo
3. Para actualizar la aplicación, use Git para obtener la última versión desde "Otros" > "Comandos Shell"
4. Navegue al directorio de la aplicación, ejecute `git pull && npm install` y reinicie el servicio Node.js

### Optimización de rendimiento en Webmin
- Utilice "Sistema" > "Procesos en ejecución" para identificar procesos que consumen muchos recursos
- Ajuste los parámetros de Node.js según sea necesario
- Monitoree el rendimiento con "Otros" > "Estado del sistema" y ajuste los recursos según sea necesario

## 8. Solución de problemas comunes usando Webmin

### Problemas de conexión
- Verifique el estado de la red en "Red" > "Configuración de red"
- Compruebe que el servicio Node.js esté en ejecución en "Sistema" > "Servicios de arranque"
- Revise los logs de la aplicación en "Sistema" > "Registro del sistema" o directamente en `/var/log/pokeguesser/app.log`
- Verifique la configuración del cortafuegos en "Red" > "Configuración de Firewall Linux"

### Errores en la carga de Pokémon
1. Verifique la conectividad a Internet desde "Otros" > "Comandos Shell" con `ping pokeapi.co`
2. Compruebe los logs de la aplicación para errores de API
3. Reinicie el servicio de la aplicación desde "Sistema" > "Servicios de arranque"
4. Verifique que la aplicación pueda acceder a la PokeAPI (pokeapi.co)

### Problemas de rendimiento
- Monitoree el uso de recursos en "Otros" > "Estado del sistema"
- Analice los procesos que consumen muchos recursos en "Sistema" > "Procesos en ejecución"
- Considere aumentar los recursos del servidor o ajustar la configuración de Node.js

### Procedimiento para reportar problemas
1. Recopile información del sistema desde Webmin ("Sistema" > "Información del sistema")
2. Exporte los logs relevantes desde "Sistema" > "Registro del sistema"
3. Tome capturas de pantalla del problema si es visible en la interfaz
4. Envíe toda la información por email o sistema de tickets

### Recursos adicionales
- Documentación de Webmin: https://doxfer.webmin.com/Webmin/Main_Page
- Documentación de Node.js: https://nodejs.org/en/docs/
- Documentación de Express: https://expressjs.com/
- Documentación de Socket.io: https://socket.io/docs/
- Documentación de la PokeAPI: https://pokeapi.co/docs/v2

