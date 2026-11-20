-- Catálogo Escudo digital: ejecución manual controlada en el entorno de desarrollo.
-- Fuentes consultadas el 20/11/2026. El catálogo es compartido con Prevención.
-- Abortamos ante colisiones ambiguas: no se pisan recursos existentes ni sus vínculos.
begin;
create temporary table escudo_carga (
  nombre text, utilidad text, imagen_o_icono text, enlace text, instrucciones text,
  compatibilidad text, categoria_escudo text, alcance_territorial text, fuente_verificacion text
) on commit drop;
insert into escudo_carga values
('BetBlocker', 'Aplicación gratuita especializada en restringir el acceso a sitios y aplicaciones de apuestas. Permite elegir períodos de restricción para gestionar el acceso desde dispositivos compatibles.', 'betblocker', 'https://betblocker.org/es/', 'Ingresá al sitio oficial, elegí tu dispositivo, instalá la aplicación y seguí las instrucciones de configuración.', 'Gratis · Consultá compatibilidad y requisitos en el sitio oficial.', 'acceso', null, 'https://betblocker.org/es/'),
('LeechBlock NG', 'Extensión gratuita y de código abierto para seleccionar sitios y establecer horarios o límites de acceso. Requiere configurar manualmente las páginas que querés restringir.', 'leechblock', 'https://www.proginosko.com/leechblock/install/', 'Instalá la extensión de tu navegador y configurá los sitios y períodos de restricción.', 'Gratis · Firefox, Chrome y Edge.', 'acceso', null, 'https://www.proginosko.com/leechblock/install/'),
('Gamban', 'Software especializado para restringir el acceso a sitios y aplicaciones de apuestas desde dispositivos compatibles. Consultá las condiciones antes de contratarlo.', 'gamban', 'https://gamban.com/es/', 'Consultá las condiciones, dispositivos compatibles y la instalación en el sitio oficial.', 'Servicio de pago · Consultá disponibilidad y precio.', 'acceso', null, 'https://gamban.com/es/'),
('Google Family Link', 'Herramienta para gestionar aplicaciones, límites de uso y accesos web con el acompañamiento de una persona adulta de confianza. No es un bloqueador especializado en apuestas.', 'family-link', 'https://families.google.com/intl/es-419/familylink/', 'Consultá la guía oficial y configurá las restricciones junto a una persona adulta de confianza.', 'Android y Chromebook supervisados · Las funciones dependen del dispositivo.', 'acceso', null, 'https://support.google.com/families/answer/7103338'),
('Tiempo en pantalla de Apple', 'Función incorporada para configurar límites de uso y restricciones de aplicaciones y contenido en dispositivos Apple, sin instalar una aplicación adicional.', 'apple', 'https://support.apple.com/es-lamr/108806', 'Abrí Tiempo en pantalla desde Configuración y consultá las restricciones de contenido y privacidad.', 'iPhone y iPad · Función integrada.', 'acceso', null, 'https://support.apple.com/es-mx/108806'),
('Mi centro de anuncios de Google', 'Permite personalizar anuncios y limitar categorías sensibles como apuestas en servicios compatibles de Google. No garantiza eliminar toda la publicidad de apuestas.', 'anuncios', 'https://myadcenter.google.com/', 'Ingresá a Mi centro de anuncios y consultá las opciones de temas sensibles disponibles para tu cuenta.', 'Gratis · La disponibilidad depende de la cuenta y el servicio.', 'estimulos', null, 'https://support.google.com/My-Ad-Center-Help/answer/12155260'),
('Controles de redes sociales', 'Las redes sociales ofrecen opciones para bloquear perfiles, silenciar cuentas, denunciar contenido y gestionar recomendaciones. Las funciones disponibles dependen de cada plataforma.', 'redes', 'https://www.argentina.gob.ar/node/517031', 'Consultá las opciones de contenido, bloqueo o denuncia de cada plataforma.', 'Las funciones disponibles dependen de la plataforma.', 'estimulos', null, 'https://www.argentina.gob.ar/node/517031'),
('Defensa del Consumidor', 'Canal oficial para reportar publicidad de juegos y apuestas en línea que incumpla los requisitos establecidos en Argentina.', 'consumidor', 'https://www.argentina.gob.ar/node/479790', 'Consultá los requisitos y completá el formulario. Si sos menor, pedí acompañamiento a una persona adulta de confianza.', 'Gratis · Argentina.', 'estimulos', 'Argentina', 'https://www.argentina.gob.ar/node/479790'),
('SEDRONAR', 'Organismo nacional que ofrece escucha y orientación ante consumos problemáticos. También pueden consultar familiares y personas cercanas.', 'sedronar', 'https://www.argentina.gob.ar/salud/sedronar', 'Llamá al 141 o consultá los recursos de atención publicados por el organismo.', '141 · Gratis · Anónimo · Nacional · 24 horas.', 'apoyo', 'Argentina', 'https://www.argentina.gob.ar/salud/sedronar'),
('Línea 102', 'Servicio de escucha, contención y orientación para niñas, niños y adolescentes, sus familias y personas cercanas, ante situaciones que afecten sus derechos. No es una línea de emergencias.', 'linea-102', 'https://www.argentina.gob.ar/node/198269', 'Llamá al 102. Si no podés comunicarte, consultá en la página los contactos provinciales.', '102 · Gratis · Confidencial · Atención organizada por provincia.', 'apoyo', 'Argentina', 'https://www.argentina.gob.ar/node/198269'),
('Orientación en urgencias de salud mental', 'Dispositivo nacional con profesionales que brindan orientación y apoyo ante urgencias relacionadas con la salud mental, tanto a personas afectadas como a su entorno.', 'salud-mental', 'https://www.argentina.gob.ar/node/513585', 'Llamá al 0800-999-0091 o consultá la información oficial.', '0800-999-0091 · Gratis · Nacional · 24 horas.', 'apoyo', 'Argentina', 'https://www.argentina.gob.ar/node/513585'),
('Jugadores Anónimos Argentina', 'Organización de ayuda mutua que reúne a personas con dificultades relacionadas con el juego para compartir experiencias y conocer grupos de apoyo. No es un servicio de urgencias ni reemplaza la atención profesional.', 'jugadores-anonimos', 'https://jugadoresanonimos.org.ar/nuestros-centros/', 'Consultá por reuniones y condiciones de participación para menores, preferentemente junto a una persona adulta de confianza.', '+54 9 11 4412-6745 · Horario publicado: 14:30 a 18:00.', 'apoyo', 'Argentina', 'https://jugadoresanonimos.org.ar/nuestros-centros/'),
('IAS Formosa · Juego Responsable', 'El Instituto de Asistencia Social de Formosa dispone de un área de Juego Responsable donde se puede solicitar información y asesoramiento sobre dificultades relacionadas con las apuestas.', 'ias-formosa', 'https://ias.gob.ar/juego-responsable.html', 'Escribí a juegoresponsable@ias.gob.ar para consultar al área de Juego Responsable.', 'juegoresponsable@ias.gob.ar · Formosa · Horario comercial.', 'apoyo', 'Formosa', 'https://ias.gob.ar/juego-responsable.html');

-- Apple se conserva sin publicar: su destino no pudo verificarse en vivo.
-- Si hay un recurso previo homónimo o con el mismo enlace, se evita sobrescribirlo.
do $$
begin
  if exists (
    select 1 from escudo_carga c join public.recursos r
      on lower(btrim(r.nombre)) = lower(btrim(c.nombre)) or r.enlace = c.enlace
    group by c.nombre having count(*) > 1
  ) then raise exception 'Catálogo Escudo: coincidencias ambiguas; revisar antes de continuar'; end if;
  if exists (
    select 1 from escudo_carga c join public.recursos r
      on lower(btrim(r.nombre)) = lower(btrim(c.nombre)) or r.enlace = c.enlace
    where r.nombre <> c.nombre or r.enlace <> c.enlace or r.categoria_escudo is distinct from c.categoria_escudo
      or r.imagen_o_icono is distinct from c.imagen_o_icono
      or r.publicado is distinct from (c.imagen_o_icono not in ('apple'))
  ) then raise exception 'Catálogo Escudo: recurso existente requiere revisión manual; no se sobrescribió'; end if;
end $$;
insert into public.recursos (nombre, utilidad, imagen_o_icono, enlace, instrucciones, compatibilidad, categoria_escudo, alcance_territorial, fuente_verificacion, verificado_en, publicado)
select c.nombre,c.utilidad,c.imagen_o_icono,c.enlace,c.instrucciones,c.compatibilidad,c.categoria_escudo,c.alcance_territorial,c.fuente_verificacion,
  case when c.imagen_o_icono in ('apple') then null else '2026-11-20 12:00:00+00'::timestamptz end,
  c.imagen_o_icono not in ('apple')
from escudo_carga c where not exists (select 1 from public.recursos r where r.nombre=c.nombre and r.enlace=c.enlace);

-- Cada medida expresa una acción diferente; varios productos pueden cumplirla.
insert into public.medidas_proteccion (recurso_id, descripcion)
select r.id, x.descripcion from (values
  ('BetBlocker', 'https://betblocker.org/es/', 'Instalé un bloqueador de apuestas'),
  ('LeechBlock NG', 'https://www.proginosko.com/leechblock/install/', 'Configuré restricciones en mi navegador'),
  ('Mi centro de anuncios de Google', 'https://myadcenter.google.com/', 'Limité la publicidad relacionada con apuestas'),
  ('Controles de redes sociales', 'https://www.argentina.gob.ar/node/517031', 'Configuré los controles de contenido de mis redes sociales'),
  ('Línea 102', 'https://www.argentina.gob.ar/node/198269', 'Solicité orientación o hablé con una persona de confianza')
) as x(nombre, enlace, descripcion)
join public.recursos r on r.nombre=x.nombre and r.enlace=x.enlace
where not exists (select 1 from public.medidas_proteccion m where m.recurso_id=r.id and m.descripcion=x.descripcion);
commit;
