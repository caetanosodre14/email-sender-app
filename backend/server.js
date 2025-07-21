document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const listaEmails = document.getElementById('lista-emails');

  // Função para carregar e-mails já enviados
  async function carregarEmails() {
    try {
      const res = await fetch('https://email-sender-app-tgrn.onrender.com/emails');
      const emails = await res.json();
      listaEmails.innerHTML = '';
      emails.forEach(email => {
        const li = document.createElement('li');
        li.textContent = `${email.para} - ${email.assunto}`;
        listaEmails.appendChild(li);
      });
    } catch (err) {
      console.error('Erro ao carregar e-mails:', err);
    }
  }

  // Carrega e-mails assim que a página abrir
  carregarEmails();

  // Quando o formulário for enviado
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const para = document.getElementById('para').value;
    const assunto = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value;

    try {
      const response = await fetch('https://email-sender-app-tgrn.onrender.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ para, assunto, mensagem })
      });

      const result = await response.json();
      if (result.success) {
        alert('Email enviado com sucesso!');
        form.reset();
        carregarEmails();
      } else {
        alert('Erro ao enviar email.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar email.');
    }
  });
});