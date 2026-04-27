# Payment Gateway - HorusPay

## 1. Descripción del proyecto y módulo
**HorusPay** es un módulo frontend y backend integrado de pasarela de pagos (Payment Gateway) desarrollado en Next.js para gestionar la venta y control de manillas inteligentes NFC.

El sistema maneja un portal con dos tipos de roles (_ADMIN_ y _CLIENTE_), lo cual permite:
- **Clientes:** Explorar manillas, simular compras (Tarjetas, PSE, Efectivo), ver su propio historial y recibir facturas en PDF autogeneradas y enviadas por correo electrónico.
- **Administrador:** Aprobar o rechazar transacciones en estado _PENDING_, manejar el historial, actualizar inventarios y precios en la tienda.

Módulos principales técnicos integrados: Autenticación segura vía JWT mediante _HTTP Cookies_ (Next Middleware), generación interactiva de documentos (`PDFKit`), validación estricta de formularios y endpoints (`Zod`), base de datos relacional `PostgreSQL`, y manejo del esquema con el moderno ORM `Prisma`.

## 2. Requisitos previos
- **Node.js**: Versión `20.x` o superior recomendada.
- **Gestor de Paquetes**: `npm` (incluido con NodeJS) o `yarn`.
- **Docker** y **Docker Compose**: Obligatorio ya que la base de datos PostgreSQL se instancia de manera contenida localmente.
- *(Opcional)* **DBeaver** o **PgAdmin**: Para interactuar cruda y visualmente con la base de datos.

## 3. Instalación paso a paso
1. **Clona** el repositorio o descomprime el código fuente:
   ```bash
   git clone <url-del-repositorio>
   cd payment-gateway
   ```

2. **Instala las dependencias** esenciales dentro del directorio usando npm:
   ```bash
   npm install
   ```

3. **Levanta la base de datos PostgreSQL** utilizando Docker. Manten la terminal en la raíz del proyecto y corre:
   ```bash
   docker-compose up -d
   ```
   *(Este comando descargará si es necesario y creará un contenedor llamado `horus_db` basado en Alpine PostgreSQL sirviendo en el puerto lógico `5432` de tu PC)*.

## 4. Configuración de variables de entorno
Crea un nuevo archivo con el nombre estricto `.env` en la raíz de la carpeta y pega lo siguiente. Introduce tus credenciales SMTP para permitir el envío real de correos electrónicos.

```env
# URL de conexión al contenedor Postgres levantado por Docker
DATABASE_URL="postgresql://horus_user:horus_password@localhost:5432/horus_db"

# Secretos y expiraciones generados para la firma de Autenticación
JWT_SECRET="7705ac8ebd83dd0205a971d8e591d9ebde1033314f69684f4c92b497fc601307"
JWT_REFRESH_SECRET="d296d87bfc80a1ffa42c5853db8a01a6236d82b9b164cb87144d87fb47709c43"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Variables para envió de correos Nodemailer
NODE_ENV="development"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="tu_correo_de_envio@gmail.com"
SMTP_PASS="tu_contrasena_de_aplicacion"
```

## 5. Configuración de Prisma y Base de Datos (Manejo de Docker vacio)
Ya que nuestra arquitectura local levanta un contedenor **totalmente vacío inicialmente**, necesitas enrutar y crear la estructura de todo el ORM Prisma junto a tu contenedor SQL. Corre esto línea por línea:

1. **Generar los modelos y el cliente de tipados:**
   (Obligatorio para que Next.js y TypeScript reconozcan la DB en la compilación).
   ```bash
   npx prisma generate
   ```

2. **Sincronizar las nuevas tablar en la BD vacía que levantó Docker:**
   ```bash
   npx prisma db push
   # O alternativamente: npx prisma migrate dev
   ```

3. **Restablecer la BD en un futuro si se daña o se atascan procesos (Reset):**
   ```bash
   npx prisma migrate reset
   ```

4. **Inyectar los datos semilla de arranque (Seed):**
   Las tiendas requieren productos. Esto rellenará de manera inicial 3 modelos de Manilla (`Basic`, `Pro`, `Elite`):
   ```bash
   npx prisma db seed
   ```

## 6. Comandos para ejecutar
Una vez las variables de ambiente y la estructura de SQL en Docker se completen correctamente, inicia tu servidor Next.js:

```bash
npm run dev
```

- Abre tu navegador web en [http://localhost:3000](http://localhost:3000)
- Accede al Login o a `/register` para interactuar con la plataforma y crearte una cuenta.
- **Asignación a modo Administrador (Opcional):**
  Dado que es un panel, todas las cuentas por default se crean bajo el rol de *CLIENTE*. Si gustas probar el panel de aprobación administrativo: abre la BD con DBeaver/PgAdmin, y modifica a mano en la tabla `User` un correo cambiando tu `role` de string *"CLIENTE"* literal a **"ADMIN"**.
