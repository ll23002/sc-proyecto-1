# Instrucciones

## Instalación y construcción
Para instalar y construir todos los servicios, ejecuta el siguiente comando:

```bash
 docker compose up --build -d 
```
```bash
 docker compose run --rm setup
```

Si ya has construido los servicios previamente, puedes iniciarlos con el siguiente comando
```bash
 docker compose up -d backend frontend pgadmin4_16 db16
```