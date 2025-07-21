const form = document.getElementById('emailForm');
const lista = document.getElementById('listaEmails');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const para = document.getElementById('para').value;
  const assunto = document.getElementById('assunto').value;
  const mensagem = document.getElementById('mensagem').value;

  const response = await fetch('http://localhost:3000/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ para, assunto, mensagem })
  });

  const data = await response.json();

  if (data.success) {
    alert('Email enviado com sucesso!');
    form.reset();
    carregarEmails();
  } else {
    alert('Erro ao enviar email.');
  }
});

async function carregarEmails() {
  const res = await fetch('http://localhost:3000/emails');
  const emails = await res.json();

  lista.innerHTML = '';
  emails.forEach(email => {
    const li = document.createElement('li');
    li.innerText = `Para: ${email.para} | Assunto: ${email.assunto}`;
    lista.appendChild(li);
  });
}

carregarEmails();