let userLocation = { latitude: null, longitude: null };

document.getElementById('getLocationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            document.getElementById('locationDisplay').innerText =
                `Широта: ${userLocation.latitude}, Долгота: ${userLocation.longitude}`;
        }, () => {
            alert('Ошибка получения местоположения.');
        });
    } else {
        alert('Гео не поддерживается вашим браузером.');
    }
});

document.getElementById('commentForm').addEventListener('submit', event => {
    event.preventDefault();
    const comment = document.getElementById('comment').value;
    const locationData = JSON.stringify(userLocation);

    let comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.push({ comment, locationData });
    localStorage.setItem('comments', JSON.stringify(comments));

    updateLocalStorageList();
});

function updateLocalStorageList() {
    const list = document.getElementById('localStorageList');
    list.innerHTML = '';
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${item.comment} - ${item.locationData}`;
        list.appendChild(li);
    });
}

updateLocalStorageList();

let db;
const request = indexedDB.open('GeoLocationDB', 1);

request.onupgradeneeded = event => {
    db = event.target.result;
    const objectStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('comment', 'comment', { unique: false });
    objectStore.createIndex('locationData', 'locationData', { unique: false });
};

request.onsuccess = event => {
    db = event.target.result;
    updateIndexedDBList();
};

document.getElementById('saveToIndexedDB').addEventListener('click', () => {
    const comment = document.getElementById('comment').value;
    const locationData = JSON.stringify(userLocation);

    const transaction = db.transaction(['comments'], 'readwrite');
    const objectStore = transaction.objectStore('comments');
    objectStore.add({ comment, locationData });
    
    transaction.oncomplete = () => {
        updateIndexedDBList();
        document.getElementById('comment').value = '';
    };
});

function updateIndexedDBList() {
    const list = document.getElementById('indexedDBList');
    list.innerHTML = '';

    const transaction = db.transaction(['comments'], 'readonly');
    const objectStore = transaction.objectStore('comments');
    const request = objectStore.getAll();

    request.onsuccess = () => {
        request.result.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${item.comment} - ${item.locationData}`;
            list.appendChild(li);
        });
    };
}
