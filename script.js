window.onload = function() {
    const apiURL = 'https://cruth.phpnet.org/epfc/caviste/public/index.php/api';


    if (sessionStorage.getItem('userId')) {
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('logoutLink').style.display = 'block';
        
    }

    // EVENTLISTENER Gestion de l'Authentification
    const loginLink = document.getElementById('loginLink');
    const container = document.getElementById('infoContainer');
    let authForm;

    loginLink.addEventListener('click', function() {
        console.log('okkkk');
        container.innerHTML = `

        <div class="bg-white p-5 rounded">
            <form id="authForm" class="col-md-4">
                <h3>Connexion</h3>
                <div class="form-group">
                    <label for="username">Nom d'utilisateur</label>
                    <input type="text" class="form-control" id="username" placeholder="Entrez votre nom d'utilisateur">
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" class="form-control" id="password" placeholder="Entrez votre mot de passe">
                </div>
                <button type="submit" id="submitLogin" class="btn btn-primary">Connexion</button>
            </form>
            </div>`;

        authForm = document.getElementById('authForm'); 
    
        const submitLogin = document.getElementById('submitLogin');

        submitLogin.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('ok');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value;
            const password = passwordInput.value;
            console.log(username)
            console.log(password)
            const basicAuth = btoa(`${username}:${password}`);

            const options = {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${basicAuth}`,
                },
            };

            fetch(apiURL + '/users/authenticate', options)
                .then(response => response.json()) 
                .then(data => {
                    console.log(data)
                    if(data.success === true) {
                        console.log('ok')
                    } else {
                        console.log('pas ok')
                    }
                    sessionStorage.setItem('userId', data.id);
                    sessionStorage.setItem('userLogin', username);
                    sessionStorage.setItem('userPassword', password);

                    authForm.style.display = 'none';
                    alert('Vous êtes connecté');
                    document.getElementById('loginLink').style.display = 'none';
                    document.getElementById('logoutLink').style.display = 'block';

                    container.innerHTML = '<div class="bg-white p-5 rounded"><p style="color: black; font-size: 20px;">Bonjour '+ username +' !</p></div>';
                })
            
                .catch(error => {
                    alert(error.message); // Affiche le message d'erreur
                });

                

        });
    });


    // EVENTLISTENER Gestion de la déconnexion
    const logoutLink = document.getElementById('logoutLink');

    logoutLink.addEventListener('click', function() {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userLogin');
        sessionStorage.removeItem('userPassword');
        alert('Vous êtes déconnecté');
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('logoutLink').style.display = 'none';

        if(!sessionStorage.getItem('userId')){
            document.getElementById('like').style.display = 'none';
            document.getElementById('unlike').style.display = 'none';
            document.getElementById('formComment').style.display = 'none';
            document.getElementById('formPic').style.display = 'none';
            document.getElementById('deleteImage').style.display = 'none';
            document.getElementById('modifNote').style.display = 'none';
            
        }
    });




    // EVENTLISTENER Affichage de la liste des vins ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    fetch(apiURL + '/wines').then(function(response) {
        if(response.ok) {
            response.json().then(function(data){
                wines = data;
                afficherListe(wines);
            });
        }
    })

    //EVENTLISTENER Gestion du bouton filtrer /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const filtreButton = document.getElementById('filtreButton');
    filtreButton.addEventListener('click', function() {
        const selectedCountry = countryDrop.value;
        const selectedDate = dateDrop.value;
        
        fetch(apiURL + '/wines')
        .then(response => response.json())
        .then(data => {  
            const ul = document.createElement('ul');
            ul.classList.add('list-group');
            data.forEach(vin => {
                const title = document.createElement('h3');
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.classList.add('listWine');
                li.classList.add('col-md-8');
                li.classList.add('listStyle');
                li.innerHTML = `<p>${vin.name}</p`;
                li.addEventListener('click', function() {
                //   informationWine(vin.name);
                infoWine(vin.name);
                });
            
                if (
                (selectedCountry === 'country' || selectedCountry === vin.country) &&
                (selectedDate === 'date' || selectedDate === vin.year.toString())
                ) {
                ul.appendChild(li);
                }
            });
            
            const container = document.getElementById('infoContainer');
            container.innerHTML = '';
            
            if (ul.children.length > 0) {
                // Si des éléments correspondent aux critères, ajoutez-les au conteneur
                container.appendChild(ul);
            } else {
                // Si aucun élément ne correspond, affichez un message
                container.innerHTML = `<p>Aucun résultat trouvé</p>`;
            }
        })
        .catch(error => {
        console.error('Une erreur s\'est produite :', error);
        });
    });
    
   
    genererDrop('country','countryDrop');
    genererDrop('date','dateDrop');

    // EVENTLISTENER Gestion de la recherche par mots clés //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const btnSearch = document.getElementById('searchButton');
    btnSearch.addEventListener('click', function() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value;
        if (searchTerm) {
            rechercherVinsParNom(searchTerm);
        }
    });

    //FUNCTION Afficher la liste des vins //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function afficherListe(wines) {
        let listeDiv = document.getElementById('liste');
        const ul = document.createElement('ul');
        ul.classList.add('list-group');
        
        for (let wine of wines) {
            let listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.classList.add('listStyle');
            listItem.classList.add('col-md-8');

            listItem.textContent = wine.name;
    
            listItem.addEventListener('click', function() {
                infoWine(wine.name);
                
            });
            ul.appendChild(listItem)
        }
        listeDiv.appendChild(ul);

    }


    // FUNCTION Afficher les details du vin cliqué //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function infoWine(name) {
        fetch(apiURL +'/wines')
        .then(response => response.json())
        .then(data => {  
            const info = document.getElementById('infoContainer');  // attention
            data.forEach(vin => {
                if (vin.name === name) {
                    info.innerHTML = `
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
                    <div class="container" id="detail">
                        <div class="row mt-5 mb-3">
                                <span id="cercle" class="mr-3">${vin.id}</span><h3><b>${vin.name}</b></h3>
                        </div>
                        <div class="row bg-white ">
                            <div class="col-md-8 mt-4 p-10">
                                <p>
                                    <b>Année</b>
                                    : ${vin.year}
                                </p>
                                <p>
                                    <b>Cépages</b>
                                    : ${vin.grapes}
                                </p>
                                <p>
                                    <b>Pays</b>
                                    : ${vin.country}
                                </p>
                                <p>
                                    <b>Région</b>
                                    : ${vin.region}
                                </p>
                                <p>
                                    <b>Prix</b>
                                    : ${vin.price} €
                                </p>
                                <p>
                                    <b>Capacité</b>
                                    : ${vin.capacity} cl
                                </p>
                                <p>
                                    <b>Couleur</b>
                                    : ${vin.color}
                                </p>
                                ${vin.extra ? `
                                <p>
                                    <b>Extra</b>
                                    : ${vin.extra}
                                </p>
                                ` : ''}
                                <div class="row mt-3">
                                    <div class="col-4">
                                        <button class="btn btn-secondary" id="descriptionButton">Description</button>
                                    </div>
                                    <div class="col-4">
                                        <button class="btn btn-secondary" id="commentButton">Commentaire</button>
                                    </div>
                                    <div class="col-4">
                                        <button class="btn btn-secondary" id="noteButton">Note</button>
                                    </div>
                                    
                                </div>
                                <div class="row mt-3">
                                    <div class="col-12">
                                        <div class="card">
                                            <div class="card-body">
                                                <div id="contentBox">
                                                    <div id="desc" class="d-block"></div>
                                                    <div id="comment" class="d-none"></div>
                                                    <div id="note" class="d-none"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mt-4">
                                    <div class="col-md-12 mb-3">
                                        <a href="index.html" class="btn btn-primary">Retour à la page d'accueil</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mt-4 h-500">
                                
                                <img src="pics/${vin.picture}" alt="${vin.name}" width="100%">
                                <div class="mt-1 ml-3"><a href="#" class="btn-sm btn-link" id="formComment"><i class="fa-regular fa-pen-to-square mr-2"></i>Commenter</a></div>
                                <div class="ml-3"><a href="#" class="btn-sm btn-link" id="formPic"><i class="fa-regular fa-image mr-2"></i>Ajouter une image<span id="nbPics" class="ml-2"></span></a></div>
                                <div class="ml-3"><a href="#" class="btn-sm btn-link" id="deleteImage"><i class="fa-regular fa-trash-can mr-2"></i>Supprimer une image</a></div>
                                <div class="ml-3"><a href="#" class="btn-sm btn-link" id="modifNote"><i class="fa-regular fa-pen-to-square mr-2"></i>Modifier la note</a></div>
                                
                                <div class="ml-3" id="like"><a href="#"  class="btn-sm btn-link"><i class="fa-solid fa-heart mr-2"></i>Ajouter aux favoris</a></div>
                                <div class="ml-3" id="unlike"><a href="#"  class="btn-sm btn-link"><i class="fa-regular fa-heart mr-2"></i>Retirer des favoris</a></div>
                                <div class="ml-4" id="nbLike"></div>

                                

                            </div>
                        </div>    
                    </div>
                    `;
                    const descriptionButton = document.getElementById('descriptionButton');
                    const commentButton = document.getElementById('commentButton');
                    
                    const desc = document.getElementById('desc');
                    const comment = document.getElementById('comment');
                    const note = document.getElementById('note');
                    const like = document.getElementById('like');
                    const unlike = document.getElementById('unlike');
                    
                    if(!sessionStorage.getItem('userId')){
                        document.getElementById('like').style.display = 'none';
                        document.getElementById('unlike').style.display = 'none';
                        document.getElementById('formComment').style.display = 'none';
                        document.getElementById('formPic').style.display = 'none';
                        document.getElementById('deleteImage').style.display = 'none';
                        document.getElementById('modifNote').style.display = 'none';
                    }
                    
                    // Afficher la description du vin //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    descriptionButton.addEventListener('click', () => {
                        
                        contentBox.innerHTML = "";
                        desc.classList.remove('d-block');
                        contentBox.innerHTML = vin.description;   
                    });
                    
                    // Afficher les commentaires du vin //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    commentButton.addEventListener('click', () => {
                        
                        contentBox.innerHTML = "";
                        comment.classList.remove('d-none');
                        //commentWine(vin.id);
                        commentWineUser(vin.id);
                        console.log(comment)
                    });

                    // Affichage de retirer ou ajouter aux favoris //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    
                    myFavorites(vin.id);
                    
                
                    // noteButton.addEventListener('click', () => {
                        
                    //     contentBox.innerHTML = "";
                    //     note.classList.remove('d-none');
                    //     console.log(note)
                    // }); 


                    // Ajouter le vin aux favoris  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    like.addEventListener('click', (e) => {
                        e.preventDefault();
                            
                        updateFavoris(vin.id);
                    
                    });

                    // Retirer le vin des favoris //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    unlike.addEventListener('click', (e) => {
                        e.preventDefault();   
                        updateFavoris(vin.id);
                        
                    });


                    countLikesWine(vin.id);

                    //toggleFavorisButtons(isInFavoris);
                


                
                
                    // Note ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                   // Affichage de la note
                    const noteInfo = document.getElementById('noteButton');
                    noteInfo.addEventListener('click', () => {
                        const contentNote = document.getElementById('contentBox');
                        const username = sessionStorage.getItem('userLogin');
                        const password = sessionStorage.getItem('userPassword');
                        const basicAuth = btoa(`${username}:${password}`)
                        const optionRequest = {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                'Authorization': `Basic ${basicAuth}`,
                            },
    
                        };

                        fetch(apiURL + '/wines/' + wineId + '/notes',optionRequest)
                            .then(response => response.json())
                            .then(data => {
                                console.log(data)
                                contentNote.innerHTML = `<p>${data.note}</p>`;
                            })
                            .catch(error => {
                                console.error('An error occurred:', error);
                            });
                    })


                    //Modifier la note 
                    const noteBtn = document.getElementById('modifNote');
                    const formulaireNote = document.createElement('div');
            
                    noteBtn.addEventListener('click', function(e) {
                        e.preventDefault()
                        
                        formulaireNote.classList.add('bg-white', 'p-5', 'rounded')
                        formulaireNote.innerHTML = `
                                <div class="form-group">
                                <form id="formNote">
                                    <h3>Note</h3>
                                    <textarea class="form-control mt-3" id="noteText" rows="4" placeholder="Votre note"></textarea>
                                    <button type="button" id="btnNote" class="btn btn-primary mt-2">Modifier</button>
                                    <button type="button" id="retour" class="btn btn-secondary mt-2 float-right">Retour</button>   
                                </form>
                                </div>
                            `; 


                        const infoContainer = document.getElementById('infoContainer')              
                        infoContainer.innerHTML = "";
                        infoContainer.appendChild(formulaireNote);

                        const btnNote = document.getElementById('btnNote');
                        
                        if(sessionStorage.getItem('userId')) {   
                        btnNote.addEventListener('click',(event) => {
                            event.preventDefault();

                            const noteText = document.getElementById('noteText');
                            const noteValue = noteText.value;
                            console.log(noteValue)
                            
                            const username = sessionStorage.getItem('userLogin');
                            const password = sessionStorage.getItem('userPassword');
                            const basicAuth = btoa(`${username}:${password}`);

                            const optionRequest = {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    'Authorization': `Basic ${basicAuth}`,
                                },
                                body: JSON.stringify({
                                    "note": noteValue
                                })
                            };

                            fetch(apiURL + '/wines/' + wineId + '/notes', optionRequest)
                                .then(response => response.json())
                                .then(data => {
                                console.log(data);
                                

                                })
                                .catch(error => {
                                    console.error('Une erreur s\'est produite:', error);
                                });
                            })
                        } else {
                            formulaireNote.innerHTML += `<p style="color:red">Vous devez être connecté pour modifier une note</p>`;

                        }
                        const retour = document.getElementById('retour');
                        retour.addEventListener('click', () => {
                            window.history.back(infoWine(name));
                        })
                    })
        

                    const formComment = document.getElementById('formComment');
                    const infoContainer = document.getElementById('infoContainer')
                
                
                    formComment.addEventListener('click', () => {
                        infoContainer.innerHTML = "";
                        const formCom = document.createElement('div');
                        formCom.classList.add('form-group','bg-white','p-5', 'rounded');
                        

                        formCom.innerHTML = `
                            <div class="form-group">
                                <form id="addComment">
                                <h3>Ajout commentaire</h3>
                                <label for="comment">Commentaire</label>
                                <textarea class="form-control" id="comment" rows="4" placeholder="Votre commentaire"></textarea>
                            </div>
                            <button type="submit" id="addComments"class="btn btn-primary">Ajouter</button>
                            <button type="button" id="retour" class="btn btn-secondary mt-2 float-right">Retour</button>
                            </form>
                        `;

                        infoContainer.appendChild(formCom);

                        const addComments = document.getElementById('addComments')
                        addComments.addEventListener('click', (event) => {console.log('ok')
                            event.preventDefault();
                            commentText = document.getElementById('comment').value;
                            //console.log(commentText);
                            submitComment(vin.id, commentText);
                        });
                        const retour = document.getElementById('retour');
                        retour.addEventListener('click', () => {
                            window.history.back(infoWine(name));
                        })

                    })

                    //Supprimer une image ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    const deleteImage = document.getElementById('deleteImage');

                    deleteImage.addEventListener('click', function () {
                        const divLiSup = document.createElement('div');
                        divLiSup.classList.add('bg-white');

                        // const infoContainer = document.getElementById('infoContainer')
                        // infoContainer.innerHTML = "";
                        // const formCom = document.createElement('div');
                        // formCom.classList.add('form-group','bg-white','p-5', 'rounded');
                        const userId = sessionStorage.getItem('userId');
                        const infoContainer2 = document.getElementById('infoContainer2');
                        let userLogin = sessionStorage.getItem('userLogin');
                        let userPassword = sessionStorage.getItem('userPassword');
                        const basicAuth = btoa(`${userLogin}:${userPassword}`);
                        const optionRequest = {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                'Authorization': `Basic ${basicAuth}`,
                            },
                        };
                        
                        fetch(`http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/${wineId}/pictures`, optionRequest)
                        .then(response => response.json())
                        .then(data => {
                        console.log(data)

                        const ul = document.createElement('ul');
                        const titre = document.createElement('h3');
                        titre.textContent = 'Supprimer une image';
                        

                        ul.classList.add('list-group');
                        
                        data.forEach(pic => {
                                console.log(pic)
                                const li = document.createElement('li');
                                li.classList.add('list-group-item');

                                li.innerHTML = `<li>${pic.id} ${userId == pic.user_id ? '<button class=" btn-sm btn-danger float-right">supprimer</button>' : ''}`;
                                ul.appendChild(li);

                                const btnDelete = li.querySelector('button');
                                
                                btnDelete.addEventListener('click', function() {
                                    const confirmation = window.confirm('Voulez-vous supprimer l\'image?');
                                if( confirmation) {
                                    const options = {
                                        method: 'DELETE',
                                        mode: 'cors',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Basic ${basicAuth}`,
                                        },
                                    };
                                    fetch(apiURL + '/wines/'+ wineId +'/pictures/'+pic.id, options)
                                    .then(response => response.json())
                                    .then(data => { 
                                        console.log(data);
                                        alert('image supprimée')
                                    })
                                    
                                }
                                
                                })
                        });
                        infoContainer2.innerHTML = "";
                        divLiSup.appendChild(titre);
                        divLiSup.appendChild(ul);
                        infoContainer2.appendChild(divLiSup);

                        })
                    
                    })


                    ///////////////////////////////////////////////////////////////////////////////

                    const formPic = document.getElementById('formPic');

                    formPic.addEventListener('click', (event) => {
                        event.preventDefault();
                        infoContainer.innerHTML = '';
                        const formPicture = document.createElement('div');
                        formPicture.classList.add('form-group','bg-white','p-5', 'rounded');

                        formPicture.innerHTML = `
                            <h3>Télécharger une image</h3>
                            <form id="addPicture" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label for="picture">Sélectionnez une image :</label>
                                    <input type="file" class="form-control-file" id="picture" name="picture">
                                </div>
                                <button type="submit" id="addImage" class="btn btn-primary">Télécharger</button>

                            </form>
                        `;
                        

                        infoContainer.appendChild(formPicture);

                        const addPicture = document.getElementById('addPicture');
                        const picture = document.getElementById('picture');
                        const wineId = 9; // Remplacez ceci par l'ID du vin approprié
                        const addImage = document.getElementById('addImage')
                        addImage.addEventListener('click', (event) => {
                            event.preventDefault();
                            uploadImage(picture, wineId);
                        });
                        

                       
                        
                    });

                    
                    const wineId = vin.id;
                    countPictures(wineId);
                        
                }

            })

            })
        .catch(error => {
            console.error('Une erreur s\'est produite :', error);
        });
    }

    // FUNCTION Rechercher par mots clés //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    const info = document.getElementById('infoContainer')
    function rechercherVinsParNom(key) {
            info.innerHTML = '';
        
            fetch(apiURL + '/wines/search?keyword=' + key)
            .then((response) => { //console.log(response)
                if (response.ok) {
                    return response.json();
                }
            })
            .then((data) => { 
                console.log(data)
                const resultCount = data.length;
                const resultText = document.createElement('p');
                resultText.textContent = `Résultats de la recherche (${resultCount} trouvés) :`;
                info.appendChild(resultText);

                const ul = document.createElement('ul');
                ul.classList.add('list-group');

                for (const wine of data) {
                    const wineItem = document.createElement('li');
                    wineItem.classList.add('list-group-item');
                    wineItem.classList.add('col-md-8');
                    wineItem.classList.add('listStyle');
                    wineItem.textContent = wine.name;


                    wineItem.addEventListener('click', function() {
                        infoWine(wine.name)

                    })

                    ul.appendChild(wineItem);
                    info.appendChild(ul);
                }  
                
                }
            );

        }


    // FUNCTION Triez vin par pays et date /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function genererDrop(filter, containerId) {
        const container = document.getElementById(containerId);
    
        if (!container) {
            console.error(`Le conteneur avec l'ID "${containerId}" n'a pas été trouvé.`);
            return;
        }
    
        if (filter === 'country' || filter === 'date') {
            fetch(apiURL + '/wines')
                .then(response => response.json())
                .then(data => {
                    const uniqueValues = new Set();
    
                    data.forEach(vin => {
                        const value = filter === 'country' ? vin.country : vin.year;
                        uniqueValues.add(value);
                    });
    
                    // Convertir l'ensemble en tableau et trier les valeurs
                    const sortedValues = Array.from(uniqueValues).sort();
    
                    // Créer les options de liste déroulante triées
                    sortedValues.forEach(value => {
                        const option = document.createElement('option');
                        option.text = value;
                        option.value = value;
                        container.appendChild(option);
                    });
                })
                .catch(error => {
                    console.log('Une erreur s\'est produite :', error);
                });
        }
    }

    // FUNCTION Commentaire de l'utilisateur connecté //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function commentWineUser(wineId) {

            let userId = sessionStorage.getItem('userId');
            const contentBox = document.getElementById('contentBox');

            fetch(apiURL + '/wines/' + wineId + '/comments')
                .then(response => response.json())
                .then(data => { console.log(data)
                    const div = document.createElement('div');
                    const ul = document.createElement('ul');
                    data.forEach(comment => {
                        const liste = document.createElement('li');
                        liste.classList.add('list-group-item', 'listStyle');
                        liste.innerHTML = comment.content;

                        if(comment.user_id === userId) {
                            const premierBouton = document.createElement('button');
                            premierBouton.textContent = 'Modifier';
                            premierBouton.classList.add('btn-sm', 'btn-primary', 'float-right', 'ml-1')
                            liste.appendChild(premierBouton);

                            const deuxiemeBouton = document.createElement('button');
                            deuxiemeBouton.textContent = 'Supprimer';
                            deuxiemeBouton.classList.add('btn-sm', 'btn-secondary', 'float-right', 'mr-1')
                            liste.appendChild(deuxiemeBouton);
            

                            //Modifier un commentaire de l'utilisateur connecté 
                            premierBouton.addEventListener('click', function() { 
                                const infoContainer = document.getElementById('infoContainer');

                                infoContainer.innerHTML = "";
                                const formCom = document.createElement('div');
                                formCom.classList.add('form-group','bg-white','p-5', 'rounded');
                                formCom.innerHTML = `
                                    <div class="form-group">
                                        <form id="addComment">
                                        <h3>Modifie commentaire</h3>
                                        <label for="comment">Commentaire</label>
                                        <textarea class="form-control" id="newComment" rows="4" placeholder="Votre commentaire"></textarea>
                                    </div>
                                    <button type="submit" id="modifComment"class="btn btn-primary">Modifier</button>
                                    <button type="button" id="retour" class="btn btn-secondary mt-2 float-right">Retour</button>
                                    </form>
                                `;

                                infoContainer.appendChild(formCom);

                                // Modifier commentaire utilisateur connecté /////////////////////////////////////////////////////////////////////////////////
                                const modifComment = document.getElementById('modifComment');


                                modifComment.addEventListener('click', function() {
                                    const contentNew = document.getElementById("newComment");
                                    const cont = contentNew.value;
                                    console.log(cont)
                                    const data = {
                                        content: cont,
                                    };

                                    let userLogin = sessionStorage.getItem('userLogin');
                                    let userPassword = sessionStorage.getItem('userPassword');
                                    const basicAuth = btoa(`${userLogin}:${userPassword}`);
                                    const options = {
                                        method: 'PUT',
                                        mode: 'cors',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Basic ${basicAuth}`,
                                        },
                                        body: JSON.stringify(data),
                                    };
                                    fetch(apiURL + '/wines/'+ wineId +'/comments/'+comment.id, options)
                                    .then(response => response.json())
                                    .then(data => { 
                                        console.log(data);
                                        alert('commentaire modifié')
                                
                                    })

                                })
                                const retour = document.getElementById('retour');
                                retour.addEventListener('click', () => {
                                    window.history.back(infoWine());
                                })
                            })

                            //Supprimer un commentaire de l'utilisateur connecté //////////////////////////////////////////////////////////////////////
                            deuxiemeBouton.addEventListener('click', function() {
                                let userLogin = sessionStorage.getItem('userLogin');
                                let userPassword = sessionStorage.getItem('userPassword');
                                const basicAuth = btoa(`${userLogin}:${userPassword}`);
                                const options = {
                                    method: 'DELETE',
                                    mode: 'cors',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Basic ${basicAuth}`,
                                    },
                                };
                                fetch(apiURL + '/wines/'+ wineId +'/comments/'+comment.id, options)
                                .then(response => response.json())
                                .then(data => { 
                                    console.log(data);
                            
                                })
                            })
                        }
                            ul.appendChild(liste);
                        
                        });
                
                    div.appendChild(ul);
                    contentBox.appendChild(div);

                })
                .catch(error => {
                    console.log("Une erreur s'est produite : "+ error);
                });

        }


    // FUNCTION ajouté un commentaire ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function submitComment(wineId,commentText) {
        let userLogin = sessionStorage.getItem('userLogin');
        let userPassword = sessionStorage.getItem('userPassword');
        const basicAuth = btoa(`${userLogin}:${userPassword}`);
    
        const optionRequest = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
                "content": commentText
            })
        };
    
        fetch(apiURL + '/wines/' + wineId + '/comments', optionRequest)
            .then(response => response.json())
            .then(data => {
                console.log('Comment submitted successfully!');
                console.log(data);
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });
    }
                    


    // FUNCTION Afficher le nombre de likes du vin sélectionné /////////////////////////////////////////////////////////////////////////////////////////////////////////

    function countLikesWine(wineId) {
        fetch(apiURL + '/wines/' + wineId + '/likes-count')
            .then(response => response.json())
            .then(data => {
                // Mise à jour du compteur local
                cptLike = data.total;

                // Mise à jour de l'élément HTML avec le nouveau total
                let nbLike = document.getElementById('nbLike');
                nbLike.innerHTML = "<p><i class='fa-solid fa-thumbs-up' style='color: #9bf3c1;''></i>" + cptLike + "</p>";
            
            })
            .catch(error => {
                console.error("Une erreur s'est produite : " + error);
            });
    }


    // FUNCTION Afficher les vins favoris de l'utilisateur ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function myFavorites(wineId) {
            let userId = sessionStorage.getItem('userId');
            fetch(apiURL + '/users/' + userId + '/likes/wines')
            .then(response => response.json())
            .then(data => {
                
                tabVinsPref = [];

                data.forEach(wine => {
                    tabVinsPref.push(wine.id);
                });

                if(tabVinsPref.includes(wineId)){
                    
                    document.getElementById('like').style.display = 'none';
                    

                } else {

                    document.getElementById('unlike').style.display = 'none';

                }    
            })
                
            .catch(error => {
                console.log("Une erreur s'est produite : " + error);
            }); 
    }

    
    // FUNCTION pour Ajouter ou retirer le vin des favoris ///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function updateFavoris(wineId){
    //obtenir les vins favoris de l'utilisateur et ensuite vérifier si le vin sélectionné est déjà dans les favoris ou pas
        let userId = sessionStorage.getItem('userId');
        let userLogin = sessionStorage.getItem('userLogin');
        let userPassword = sessionStorage.getItem('userPassword');

        if (!userId || !userLogin || !userPassword) {
            alert("Vous devez être connecté pour ajouter aux favoris.");
            return;
        }

        let oLike = {
            like: null
        };

        fetch(apiURL + '/users/'+ userId +'/likes/wines')
        .then(response => response.json())
        .then(data => {
            
            tabVinsPref = [];

            data.forEach(wine => {
                tabVinsPref.push(wine.id);
            });

            if(tabVinsPref.includes(wineId)){
                
                oLike.like = false; // je retire le vin des favoris
                console.log(oLike.like)
                

            } else {

                oLike.like = true; // j'ajoute le vin aux favoris
                console.log(oLike.like)
                

            }

            const basicAuth = btoa(`${userLogin}:${userPassword}`);
                    
            const options = {
                'method': 'PUT',
                'mode': 'cors',
                'headers': {
                    'content-type': 'application/json; charset=utf-8',
                    'Authorization': 'Basic '+basicAuth
                    
                },
                'body': JSON.stringify({ "like": oLike.like })
            };

                fetch( apiURL + '/wines/' + wineId + '/like', options)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
            
                        if(oLike.like === true){
                            alert("Le vin a bien été ajouté aux favoris");
                            // toggleFavorisButtons(true);
                            document.getElementById('like').style.display = 'none';
                            document.getElementById('unlike').style.display = 'block';

                        }else if(oLike.like === false){
                            alert("le vin a bien été retiré des favoris");
                            // toggleFavorisButtons(false);
                            document.getElementById('unlike').style.display = 'none';
                            document.getElementById('like').style.display = 'block';

                        } else {
                            alert("Une erreur s'est produite");
                        }
                        countLikesWine(wineId);

                    })
                    .catch(error => {
                        console.error("Une erreur s'est produite : " + error);
                    });

        })

            
        .catch(error => {
            console.log("Une erreur s'est produite : " + error);
        }); 
       
                        
                
    }


    // FUNCTION Ajouter une image //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function uploadImage(imageInput) {
        let userLogin = sessionStorage.getItem('userLogin');
        let userPassword = sessionStorage.getItem('userPassword');

        const basicAuth = btoa(`${userLogin}:${userPassword}`);
        
        // Récupérez la valeur de l'input de l'image
        const imageValue = imageInput.value;
        console.log(imageValue)
        
        if (!imageValue) {
            // Aucune image sélectionnée, affichez un message d'erreur
            console.log('Aucune image sélectionnée. Veuillez choisir une image.');
            return;
        }
        
        const optionRequest = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
                "content": imageValue
            })
        };
        
        fetch(apiURL +'/'+ vin.id + '/pictures', optionRequest)
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Une erreur s\'est produite :', error);
            });
            
            
    }
    
    //FUNCTION afficher nombre de photos //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function countPictures(wineId) {
        let countPic = 0;
        const nbPics = document.getElementById('nbPics');
        const username = sessionStorage.getItem('userLogin');
        const password = sessionStorage.getItem('userPassword');
        const basicAuth = btoa(`${username}:${password}`);

        const optionRequest = {
            method: "GET",
            headers: {
                'Authorization': `Basic ${basicAuth}`,
            },
        };

        fetch(apiURL + '/wines/' + wineId + '/pictures', optionRequest)
                .then(response => response.json())
                .then(data => {
                    //console.log(data)
                    data.forEach(picture => { 
                        
                        countPic++;
                                                
                    })

                    nbPics.textContent = countPic+'/3';
                })
                .catch(error => {
                    console.error('Une erreur s\'est produite :' + error);
                });
    }


}
