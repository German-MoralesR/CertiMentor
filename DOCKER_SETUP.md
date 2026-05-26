# 🐳 Configuración de Docker para MentoriasG4

## Requisitos

- **Docker Desktop** instalado en tu Mac
- **DBeaver** instalado (opcional, para visualización)

## Paso 1: Levantar los Contenedores

Desde la carpeta raíz del proyecto (`MentoriasG4/`), ejecuta:

```bash
docker-compose up -d
```

Este comando:
- Descargará la imagen de MySQL 8.0 compatible con ARM64
- Creará un contenedor llamado `mentoriasg4-mysql`
- Inicializará las 4 bases de datos automáticamente
- Ejecutará en segundo plano (-d)

## Paso 2: Verificar que el Contenedor está Corriendo

```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME                    STATUS              PORTS
mentoriasg4-mysql       Up (healthy)        0.0.0.0:3306->3306/tcp
```

## Paso 3: Conectar DBeaver

### 3.1 Crear nueva conexión

1. Abre **DBeaver**
2. En la esquina superior izquierda, haz clic en **Database** → **New Database Connection**
3. Selecciona **MySQL** y haz clic en **Next**

### 3.2 Configurar conexión

Completa los campos con:

| Campo | Valor |
|-------|-------|
| **Server Host** | `localhost` |
| **Port** | `3306` |
| **Database** | Déjalo vacío (se conectará al servidor) |
| **Username** | `root` |
| **Password** | `root` |
| **Save password locally** | ✓ (opcional) |

### 3.3 Probar la conexión

Haz clic en **Test Connection**. Si aparece un mensaje de error sobre `mysql-connector-java`, DBeaver te ofrecerá descargarlo automáticamente. Haz clic en **Download**.

Luego haz clic en **Finish**.

## Paso 4: Ver las Bases de Datos

En DBeaver, deberías ver bajo la conexión MySQL:
- `db_user_service`
- `db_mentorship_service`
- `db_feedback_service`
- `db_scheduling_service`

## Configurar los Microservicios

Las credenciales en los `application.properties` ya están correctas:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/db_[service_name]?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

Sin embargo, verifica que la **contraseña** esté configurada como `root` en todos los servicios. En caso de ser diferente, actualiza los `application.properties`.

## Comandos Útiles

### Ver logs del contenedor
```bash
docker-compose logs -f mysql-db
```

### Acceder a MySQL directamente
```bash
docker-compose exec mysql-db mysql -uroot -proot
```

### Detener los contenedores
```bash
docker-compose down
```

### Detener y eliminar volúmenes (CUIDADO: borra todos los datos)
```bash
docker-compose down -v
```

### Reiniciar los contenedores
```bash
docker-compose restart
```

## Solución de Problemas

### El contenedor no inicia
```bash
# Revisa los logs
docker-compose logs mysql-db

# Elimina el contenedor e intenta de nuevo
docker-compose down -v
docker-compose up -d
```

### No puedo conectar desde DBeaver
- Verifica que Docker Desktop esté corriendo
- Verifica que el puerto 3306 no esté en uso: `lsof -i :3306`
- Reinicia el contenedor: `docker-compose restart`

### Cambiar la contraseña de root (opcional)
Si quieres cambiar la contraseña:

1. Edita `docker-compose.yml`
2. Cambia `MYSQL_ROOT_PASSWORD: root` a tu contraseña
3. Ejecuta `docker-compose down -v` y luego `docker-compose up -d`
4. Actualiza los `application.properties` de todos los servicios

## Próximos Pasos

1. ✅ Levanta los contenedores con `docker-compose up -d`
2. ✅ Verifica con `docker-compose ps`
3. ✅ Conecta DBeaver siguiendo los pasos anteriores
4. ✅ Ejecuta tus microservicios Spring Boot (usarán automáticamente las bases de datos Docker)

¡Listo! Ahora tus microservicios pueden conectarse a MySQL en Docker.
