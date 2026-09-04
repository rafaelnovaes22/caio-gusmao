/** @param {string} html @returns {string[]} */
export function contactIssues(html) {
  const visible = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const forms = [...visible.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(([form]) => form);
  const unavailable = /<[^>]+data-contact-status="unavailable"[^>]*>[^<]*Contato temporariamente indisponível\.[^<]*não está recebendo/i.test(visible);
  const links = [...html.matchAll(/(?:https?:\/\/)?wa\.me\/([^\s"'<>?]+)/g)].map((match) => match[1]);
  const errors = [];
  if (unavailable) {
    if (links.length) errors.push('contato indisponível ainda contém destino WhatsApp');
    for (const form of forms) {
      const controls = [...form.matchAll(/<(?:input|select|textarea|button)\b[^>]*>/gi)].map(([tag]) => tag);
      if (!/aria-describedby="contact-status"/.test(form) || !controls.length || controls.some((tag) => !/\sdisabled(?:\s|>|=)/.test(tag))) errors.push('contato indisponível permite coleta ou não aponta para o aviso');
    }
    return errors;
  }
  if (!links.length) errors.push('sem contato confirmado nem estado indisponível explícito');
  if (links.some((phone) => !/^55\d{10,11}$/.test(phone) || /^55\d{2}9{5}0{4}$/.test(phone))) errors.push('destino WhatsApp inválido ou fictício');
  if (forms.length && !/WhatsApp/i.test(visible)) errors.push('formulário ativo sem aviso de destino WhatsApp');
  return errors;
}

