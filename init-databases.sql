-- Script para crear todas las bases de datos necesarias para MentoriasG4
-- Este archivo se ejecuta automáticamente al iniciar el contenedor MySQL

-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS db_user_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_mentorship_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_feedback_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_scheduling_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar que las bases de datos fueron creadas
SHOW DATABASES;
