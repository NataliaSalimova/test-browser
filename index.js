document.addEventListener('DOMContentLoaded', ()=> {

    // Задача 1. Сохранение куки
    function setCookie() {
        const name = 'test-cookie';
        const value = 'test-cookie-value';
        const quantityDay = 3;
        const quantityOfMillisecondsInDay = 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + quantityDay * quantityOfMillisecondsInDay).toUTCString();
        const path = '/';
        const domain = 'sub.test-site.com';

        document.cookie = `${name}=${encodeURIComponent(value)}; domain=${domain}; path=${path}; expires=${expires}; samesite=lax`;
    }

    setCookie();

    // Задача 2. Сохранение/получение значения из localstorage

    function setItemInLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getItemFromLocalStorage(key) {
        return localStorage.getItem(key);
    }

    setItemInLocalStorage('test', { id: 4, name: 'test' });
    getItemFromLocalStorage('test');

    // Задача 3. Сохранение и получение данных IndexedDB

    const openRequest = indexedDB.open('testDB', 1);
    const nameStore = 'user';
    let db;

    // Получение пользователей и запись в IndexedDB
    function addUsersToIndexedDB () {
        openDB();
        getUsers();
    }

    function openDB () {
        openRequest.onerror = ()=> {
            onOpenDBError(openRequest);
        };

        openRequest.onupgradeneeded = (event)=> {
            onOpenDBUpgradeneeded(event);
        };

        openRequest.onsuccess = (event) => {
            db = event.target.result;
        }
    }

    function onOpenDBError(request) {
        console.error('Error', request.error);
    }

    function onOpenDBUpgradeneeded(event) {
        db = event.target.result;

        if (!db.objectStoreNames.contains(nameStore)) {
            db.createObjectStore(nameStore, { autoIncrement: true });
        }
    }

    function getUsers() {
        fetch('https://jsonplaceholder.typicode.com/users')
            .then(response => response.json())
            .then(data => onGetUsersSuccess(data))
            .catch(error => onGetUsersError(error));
    }

    function onGetUsersSuccess(users) {
        users.forEach((user)=> {
            addUserToIndexDB(user);
        })
    }

    function onGetUsersError(error) {
        console.log(error);
    }

    function addUserToIndexDB(item) {
        const transaction = db.transaction(nameStore, 'readwrite');
        const usersStore = transaction.objectStore(nameStore);
        const request = usersStore.add(item, item.id);

        request.onerror = (event)=> {
            if (request.error.name === 'ConstraintError') {
                console.log('Пользователь с таким id уже существует');
                event.preventDefault();
                event.stopPropagation();
            }
        }

        transaction.onabort = function() {
            console.log('Ошибка', transaction.error);
        };

        transaction.oncomplete = () => {
            console.log('stored user!')
        }
    }

    addUsersToIndexedDB();

    // Получение пользователя из IndexedDB по id

    function getUserFromIndexDBYId(id) {
        const transaction = db.transaction(nameStore, 'readonly');
        const usersStore = transaction.objectStore(nameStore);
        const res = usersStore.get(id);

        res.onsuccess = (event) => {
            const user = event.target.result;

            user ? console.log(user) : getUser(id);
        }

        res.onerror = (event) => {
            alert(`Ошибка получения пользователя с ${id} ` + event.target.errorCode);
        }
    }

    async function getUser(id) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
        const res = await response.json();

        if (response.status === 404) {
            alert('Пользователь не найден')
        } else {
            console.log(res)
        }
    }
})