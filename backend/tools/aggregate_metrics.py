#!/usr/bin/env python3
"""
aggregate_metrics.py

Versión sin rangos de fecha.
Agrega métricas por IP a partir de todos los registros de la tabla logs_sesion.
Inserta resultados en ml_features_minute.
"""

import pymysql
from datetime import datetime
import math
import statistics

# ---------------- Config DB (datos directos)
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASS = "123456"
DB_NAME = "proyecto_auditoria"

# ---------------- Helpers de tiempo
def to_mysql_str(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# ---------------- Conexión
def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )

# ---------------- Crear tabla si no existe
def ensure_table_exists(conn):
    create_sql = """
    CREATE TABLE IF NOT EXISTS ml_features_minute (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_cliente VARCHAR(45) NOT NULL,
      ventana_inicio DATETIME NOT NULL,
      requests_total INT DEFAULT 0,
      intentos_fallidos INT DEFAULT 0,
      ratio_fallos DECIMAL(6,4) DEFAULT 0,
      tiempo_medio_entre_requests_ms FLOAT DEFAULT NULL,
      desviacion_tiempo_ms FLOAT DEFAULT NULL,
      usuarios_unicos INT DEFAULT 0,
      promedio_respuesta_ms FLOAT DEFAULT NULL,
      hora_dia INT DEFAULT 0,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_ip_ventana (ip_cliente, ventana_inicio),
      INDEX (ventana_inicio)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    with conn.cursor() as cur:
        cur.execute(create_sql)

# ---------------- Agregar métricas a partir de toda la tabla
def aggregate_all(conn):
    q = """
      SELECT id_log, id_usuario, metodo, exito, ip_cliente, fecha, detalles
      FROM logs_sesion
      ORDER BY ip_cliente, fecha ASC
    """
    with conn.cursor() as cur:
        cur.execute(q)
        rows = cur.fetchall()

    if not rows:
        print("No hay registros en logs_sesion. Nada que agregar.")
        return 0, 0

    by_ip = {}
    for r in rows:
        ip = r["ip_cliente"] or "unknown"
        by_ip.setdefault(ip, []).append(r)

    inserts = 0
    for ip, recs in by_ip.items():
        total = len(recs)
        failed = sum(1 for x in recs if not x["exito"])
        ratio = round(failed / total, 4) if total > 0 else 0.0

        times = [r["fecha"] for r in recs if r["fecha"] is not None]
        times.sort()
        inter_ms = []
        for i in range(1, len(times)):
            diff = (times[i] - times[i - 1]).total_seconds() * 1000.0
            inter_ms.append(diff)

        mean_inter_ms = float(statistics.mean(inter_ms)) if inter_ms else None
        std_inter_ms = float(statistics.pstdev(inter_ms)) if inter_ms else None
        unique_users = len(set([r["id_usuario"] for r in recs if r["id_usuario"] is not None]))
        hora_dia = datetime.now().hour

        insert_sql = """
          INSERT IGNORE INTO ml_features_minute
            (ip_cliente, ventana_inicio, requests_total, intentos_fallidos, ratio_fallos,
             tiempo_medio_entre_requests_ms, desviacion_tiempo_ms, usuarios_unicos, hora_dia)
          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        with conn.cursor() as cur:
            cur.execute(
                insert_sql,
                (
                    ip,
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    total,
                    failed,
                    ratio,
                    mean_inter_ms,
                    std_inter_ms,
                    unique_users,
                    hora_dia,
                ),
            )
            inserts += cur.rowcount

    return inserts, len(by_ip)

# ---------------- Main
def main():
    print("aggregate_metrics - inicio (sin rangos de fecha)")
    conn = get_conn()
    try:
        ensure_table_exists(conn)
        inserts, ips = aggregate_all(conn)
        print(f"Finalizado. IPs procesadas: {ips}, filas insertadas: {inserts}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
