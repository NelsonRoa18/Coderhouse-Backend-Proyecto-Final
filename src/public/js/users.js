
const btnUpdate = document.getElementById('Update_User');
const btnDelete = document.getElementById('Delete_User');

btnDelete.addEventListener('click', () => {
    // Obtener el id del usuario desde el li padre
    const li = this.closest('li');
    const id = li.getAttribute('data-id');
    console.log(li);
    // Crear el objeto con el id a enviar
    const data = { id: id };

    // Enviar los datos al servidor usando fetch
/*     fetch('/ruta-del-servidor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        }); */
});


btnUpdate.addEventListener('click', (e) => {
    // Obtener el id del usuario desde el li padre
    const li = e.target.closest('li');
    const id = li.getAttribute('data-id');
    console.log(li);
    // Crear el objeto con el id a enviar
    const data = { id: id };

    // Enviar los datos al servidor usando fetch
    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});