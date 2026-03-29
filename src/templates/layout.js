/**
 * EVA by Solvix — Base HTML email layout.
 *
 * JERARQUÍA DE COLOR (obligatoria):
 *  - Fondo externo:  BG_OUTER (#F1F5F9) — suave, neutro
 *  - Header:         SURFACE (#FFFFFF) + barra teal izquierda (ACCENT)
 *  - Body:           SURFACE (#FFFFFF)
 *  - Footer:         BASE (#1F2A37) — ÚNICO bloque oscuro permitido
 *
 * Tipografía: Inter-first via @import.
 * Compatibilidad: inline styles, tablas, MSO conditionals.
 * PROHIBIDO: fondos oscuros en header, gradientes, efectos decorativos.
 */

import { BRAND, FONT } from '../brand.js';

// ─────────────────────────────────────────────────────────────────────────────
// Layout principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string}  opts.preheader
 * @param {string}  opts.title
 * @param {string}  opts.bodyHtml
 * @returns {string} HTML completo
 */
export function wrapInLayout({ preheader = '', title = 'EVA — Asistente Inteligente', bodyHtml = '' }) {
  const safePreheader = _esc(preheader);
  const safeTitle     = _esc(title);

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${safeTitle}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Inter — fuente oficial. Outlook desktop usa fallback sistema (Segoe UI). */
    @import url('${FONT.IMPORT_URL}');

    /* Reset */
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto;
          line-height:100%; outline:none; text-decoration:none; }
    body { margin:0 !important; padding:0 !important; width:100% !important;
           background-color:${BRAND.BG_OUTER}; }

    a { color:${BRAND.ACCENT}; text-decoration:none; }
    a:hover { text-decoration:underline; }

    @media only screen and (max-width:600px) {
      .email-container { width:100% !important; max-width:100% !important; }
      .email-header td { padding:18px 18px !important; }
      .email-body   td { padding:24px 18px !important; }
      .email-footer td { padding:16px 18px !important; }
      .meta-card    td { padding:9px 13px !important; }
      h1.email-title    { font-size:18px !important; line-height:26px !important; }
      .hide-mobile      { display:none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.BG_OUTER};font-family:${FONT.PRIMARY};">

  <!-- Preheader oculto -->
  <div style="display:none;font-size:1px;color:${BRAND.BG_OUTER};line-height:1px;
              max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${safePreheader}&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;
  </div>

  <!-- Wrapper externo -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
         style="background-color:${BRAND.BG_OUTER};">
    <tr>
      <td align="center" valign="top" style="padding:32px 16px;">

        <!--[if mso]>
        <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr><td>
        <![endif]-->

        <!-- Tarjeta principal -->
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0"
               width="600" style="max-width:600px;width:100%;
               background-color:${BRAND.SURFACE};
               border-radius:4px;overflow:hidden;
               border:1px solid ${BRAND.BORDER};
               box-shadow:0 1px 4px rgba(0,0,0,0.05);">

          <!-- ══════════════════════════════════════════════════════════════
               HEADER — fondo claro, barra teal izquierda
               NO usar fondo oscuro aquí. Único oscuro permitido: footer.
               ══════════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-header" style="padding:0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>

                  <!-- Barra teal (4px) — identidad visual EVA -->
                  <td style="width:4px;background-color:${BRAND.ACCENT};padding:0;">&nbsp;</td>

                  <!-- Contenido del header -->
                  <td style="background-color:${BRAND.SURFACE};
                             padding:20px 28px;
                             border-bottom:1px solid ${BRAND.BORDER};">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>

                        <!-- Lockup: EVA by Solvix -->
                        <!-- Cuando exista asset SVG, reemplazar este bloque por <img src="..."> -->
                        <td valign="middle">
                          <span style="font-family:${FONT.PRIMARY};font-size:20px;font-weight:700;
                                       color:${BRAND.BASE};letter-spacing:2px;
                                       display:block;line-height:1.1;">EVA</span>
                          <span style="font-family:${FONT.PRIMARY};font-size:9px;font-weight:600;
                                       color:${BRAND.ACCENT};letter-spacing:1.5px;
                                       text-transform:uppercase;display:block;margin-top:3px;">
                            by Solvix
                          </span>
                        </td>

                        <!-- Descriptor (derecha) -->
                        <td valign="middle" align="right">
                          <span style="font-family:${FONT.PRIMARY};font-size:11px;font-weight:400;
                                       color:${BRAND.TEXT_SECONDARY};display:block;">
                            Asistente Inteligente Empresarial
                          </span>
                        </td>

                      </tr>
                    </table>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════════════════════════════════════════════════════════════
               BODY
               ══════════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-body" colspan="1"
                style="background-color:${BRAND.SURFACE};padding:32px 32px 24px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ══════════════════════════════════════════════════════════════
               FOOTER — único bloque oscuro permitido, bajo peso visual
               ══════════════════════════════════════════════════════════════ -->
          <tr>
            <td class="email-footer"
                style="background-color:${BRAND.BASE};padding:18px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 2px 0;font-family:${FONT.PRIMARY};font-size:12px;
                               font-weight:500;color:#9CA3AF;">
                      EVA by Solvix
                    </p>
                    <p style="margin:0;font-family:${FONT.PRIMARY};font-size:11px;
                               font-weight:400;color:#4B5E6D;">
                      Mensaje generado automáticamente. No respondas a este correo.
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:16px;white-space:nowrap;">
                    <p style="margin:0;font-family:${FONT.PRIMARY};font-size:11px;color:#4B5E6D;">
                      Solvix &copy; ${new Date().getFullYear()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!--[if mso]>
        </td></tr></table>
        <![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────

function _esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
