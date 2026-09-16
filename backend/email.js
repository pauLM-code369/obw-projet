require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function envoyerEmailContact(nom, email, telephone, message) {
  try {
    await resend.emails.send({
      from: 'OPEN Business World <onboarding@resend.dev>',
      to: 'infos@obwstore.ci',
      subject: `Nouveau message de contact — ${nom}`,
      html: `
        <h2>Nouveau message reçu</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });
    console.log('Email de contact envoye avec succes');
  } catch (erreur) {
    console.error('Erreur envoi email contact :', erreur);
  }
}

async function envoyerEmailConfirmationCommande(commande) {
  if (!commande.email) return;

  try {
    const lignesHtml = commande.lignes.map(l => `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #eee;">
          <div style="font-weight:600; color:#222; font-size:14px;">${l.quantite}× ${l.produit.nom}</div>
        </td>
        <td style="padding:12px 0; border-bottom:1px solid #eee; text-align:right; font-size:14px; color:#333;">
          ${(l.prixUnitaire * l.quantite).toLocaleString('fr-FR')} F CFA
        </td>
      </tr>
    `).join('');

    const blocAdresse = commande.typeLivraison === 'Retrait'
      ? `<strong>Point de retrait</strong><br />Plateau, Immeuble Mali, Abidjan`
      : `<strong>Adresse de livraison</strong><br />${commande.nom}<br />${commande.adresse}${commande.ville ? ', ' + commande.ville : ''}<br />Côte d'Ivoire`;

    await resend.emails.send({
      from: 'OPEN Business World <onboarding@resend.dev>',
      to: commande.email,
      subject: `Confirmation de votre commande n°${commande.id} — OBW`,
      html: `
        <div style="max-width:600px; margin:0 auto; font-family:Arial, sans-serif; color:#222;">

          <div style="background:#0B5FCC; padding:24px; text-align:center; border-radius:8px 8px 0 0;">
            <h1 style="color:#fff; margin:0; font-size:22px;">Merci pour votre commande !</h1>
          </div>

          <div style="background:#fff; padding:24px; border:1px solid #eee; border-top:none;">

            <p style="font-size:14px; color:#555;">
              Nous préparons votre commande. Nous vous contacterons au <strong>${commande.telephone}</strong> pour confirmer les détails.
            </p>

            <div style="background:#F0F7FF; border-radius:8px; padding:14px; margin:16px 0; text-align:center;">
              <span style="font-size:13px; color:#666;">Code de confirmation</span><br />
              <strong style="font-size:20px; color:#0B5FCC; letter-spacing:1px;">${commande.codeConfirmation}</strong>
            </div>

            <h3 style="font-size:16px; border-bottom:2px solid #0B5FCC; padding-bottom:8px;">Résumé de la commande</h3>

            <table style="width:100%; border-collapse:collapse;">
              ${lignesHtml}
            </table>

            <table style="width:100%; margin-top:12px;">
              <tr>
                <td style="padding:8px 0; font-size:18px; font-weight:700;">Total</td>
                <td style="padding:8px 0; font-size:18px; font-weight:700; text-align:right; color:#0B5FCC;">
                  ${commande.total.toLocaleString('fr-FR')} F CFA
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:4px 0; font-size:13px; color:#888;">
                  Montant payé aujourd'hui : 0 F CFA (paiement à la livraison)
                </td>
              </tr>
            </table>

            <h3 style="font-size:16px; border-bottom:2px solid #0B5FCC; padding-bottom:8px; margin-top:24px;">Informations client</h3>

            <p style="font-size:14px; line-height:1.6;">
              ${blocAdresse}
            </p>

            <p style="font-size:14px;">
              <strong>Paiement</strong><br />${commande.modePaiement}
            </p>

            <p style="font-size:14px;">
              <strong>Mode</strong><br />${commande.typeLivraison}
            </p>

          </div>

          <div style="text-align:center; padding:16px; font-size:12px; color:#999;">
            OPEN Business World — Plateau, Immeuble Mali, Abidjan
          </div>

        </div>
      `,
    });
    console.log('Email de confirmation commande envoye avec succes');
  } catch (erreur) {
    console.error('Erreur envoi email confirmation :', erreur);
  }
}

module.exports = { envoyerEmailContact, envoyerEmailConfirmationCommande };
