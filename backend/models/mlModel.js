export const MLFeature = {
  id: Number,
  ip_cliente: String,
  ventana_inicio: Date,
  requests_total: Number,
  intentos_fallidos: Number,
  ratio_fallos: Number,
  tiempo_medio_entre_requests_ms: Number,
  usuarios_unicos: Number,
  promedio_respuesta_ms: Number,
  hora_dia: Number,
  creado_en: Date
};

export const MLAnomalia = {
  id: Number,
  ip_cliente: String,
  ventana_inicio: Date,
  es_anomalia: Boolean,
  puntaje_anomalia: Number,
  version_modelo: String,
  metadata: Object,
  creado_en: Date
};
