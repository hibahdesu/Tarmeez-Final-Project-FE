let url = 'https://tarmeezAcademy.com/api/v1';

//Infinite Scroll
window.addEventListener('scroll', handleInfiniteScroll);
let currentPage = 1;
lastPage = 1;


function handleInfiniteScroll() {
    // const endOfPage = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;

    console.log(endOfPage);

    if (endOfPage && currentPage < lastPage) {
        currentPage++;
        getPosts(currentPage, false);
    }
}

let postsDiv = document.getElementById('posts');



function getPosts(page = 1, reload = true) {
    toggleLoader(true);
    axios.get(`${url}/posts?limit=10&page=${page}`)
    .then((response) => {
        const posts = response.data.data;
        lastPage = response.data.meta.last_page;
        console.log('Now',response);
        // console.log(posts);

        if (reload) {
            postsDiv.innerHTML = '';
        }


        posts.forEach((post) => {
            console.log(`This is the post ${post.id}`);
            let author = post.author.name;
            let profileImage = post.author.profile_image;
            // let imgSrc = post.image;
            let imgSrc = typeof post.image === 'string' ? post.image : (post.image?.url ?? null);

            let createdAt = post.created_at;
            let commentsCount = post.comments_count;
            let tags = post.tags;
            const id = post.id;
            const currentPostTagsId = `posts-tags-${id}`
            // console.log(tags);
            let title = post.title;
            let user = getCurrentUser();
            let isMyPost = user != null && post.author.id == user.id;
            let editButtonContent = ``;
            
            if (isMyPost) {
            editButtonContent = `
                <div class='ms-auto d-flex gap-2'>
                    <button class="btn btn-secondary" onClick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                    <button class="btn btn-danger" onClick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                </div>
            `;
            } 


            if (title != null) {
                title
            } else {
                title = ''
            }
            let content = `
            <div class="card shadow my-2">
                        <div class="card-header d-flex align-items-center gap-1">
                            <span class='d-flex align-items-center gap-1 userClickedOnPost' id='' onclick="userClickedOnPost(${post.author.id})">
                                <img src="${profileImage}" class="profile rounded-circle border border-2" alt="person">
                                <p class="mb-0">${author}</p>
                            </span>
                            ${editButtonContent}
                        </div>
                        
                        <div class="card-body" onClick="postClickedOn(${post.id})">
                            ${imgSrc ? `<img src="${imgSrc}" class="card-img-top w-100" alt="post image">` : ''}
                            <span class="min">${createdAt}</span>
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">${post.body}</p>
                            <hr />
                            <div class='d-flex gap-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                                </svg>
                                <span class='d-flex gap-2'>
                                    (${commentsCount}) comments

                                    <span class='d-flex gap-1' id=${currentPostTagsId}>
                                        
                                    </span>
                                </span>
                                
                            </div>
                        </div>
            </div>
            `;

            postsDiv.innerHTML += content;
            postsTags = document.getElementById(currentPostTagsId);
            postsTags.innerHTML = '';

            tags.forEach((tag) => {
                // console.log(tag.name);
                let tagsContent = `<button class='btn btn-sm rounded-5 tag'>${tag.name}</button>`;
                postsTags.innerHTML += tagsContent;
            })
        })
    })
    .finally(() => {
        toggleLoader(false);
    });

};

let postModalTitle = document.querySelector('.post-modal-title');
let postIdInpute = document.getElementById('post-id-input');
let deleteModel = document.getElementById('deleteModel');
const deleteBtn = document.getElementById('delete-btn');
const deletePostIdInput = document.getElementById('delete-post-id-input')

function editPostBtnClicked(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj));
    createBtn.innerHTML = 'Update';
    postIdInpute.value = post.id;
    // console.log(post);
    postPhoto.value = ''; 
    postModalTitle.innerHTML = 'Edit Post';
    postBodyInput.value = post.body;
    postTitle.value = post.title;

    let postModal = new bootstrap.Modal(addModel, {});
    postModal.toggle();
    console.log("Edit button clicked");
};


function deletePostBtnClicked(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj));
    console.log("Hello from delete");
    deletePostIdInput.value = post.id;

    let postModal = new bootstrap.Modal(deleteModel, {});
    postModal.toggle();
    console.log("Delete button clicked");
};

function confirmDelete() {
    const postId = deletePostIdInput.value;
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    }

    axios.delete(`${url}/posts/${postId}`, {
        headers: headers
    })
    .then((response) => {
        const modal = deleteModel;
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        showAlert('The post Has Been Deleted Successfully', 'success');
        getPosts()
    })
    .catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger');
    })
}

function CreateBtnClickedOn() {
    createBtn.innerHTML = 'Create';
    postIdInpute.value = '';
    postModalTitle.innerHTML = 'Create A New Post';
    postBodyInput.value = '';
    postTitle.value = '';
    postPhoto.value = ''; 

    let postModal = new bootstrap.Modal(addModel, {});
    postModal.toggle();
}


const urlParams = new URLSearchParams(window.location.search);

const urlId = urlParams.get(`postId`);
console.log(urlId);
function postClickedOn(id) {
    console.log('Hi Clicked me');
    // console.log(id);
    window.location = `postDetails.html?postId=${id}`;
}

let userPostName = document.querySelector('.user-post-name');

function getPost() {
    axios.get(`${url}/posts/${urlId}`)
    .then((response) => {
        const post = response.data.data;
        const comments = post.comments;
        const author = post.author;

        userPostName.innerHTML = '';
        userPostName.innerHTML = author.username;

        let postDiv = document.getElementById('postDiv');
        if (!postDiv) {
            console.warn("postDiv not found on this page");
            return;
        }

        const imgSrc = post.image;
        const createdAt = post.created_at;
        const title = post.title ?? '';
        const body = post.body ?? '';
        const commentsCount = post.comments_count;

        let commentsContent = ``;
        comments.forEach((comment) => {
            commentsContent += `
            <div class="p-3 comment">
                    <div>
                            <img src="${comment.author.profile_image}" alt="" class="rounded-circle comment-profile-img" >
                            <p>${comment.author.username}</p>
                    </div>
                    <div>
                        ${comment.body}
                    </div>
                </div>
            `
        })

        let postContent = `
        <div class="card shadow my-2">
            <div class="card-header d-flex align-items-center gap-1">
                <img src="${author.profile_image}" class="profile rounded-circle border border-2" alt="person">
                <p class="mb-0">@${author.username}</p>
            </div>
            <div class="card-body">
                ${imgSrc ? `<img src="${imgSrc}" class="card-img-top w-100" alt="post image">` : ''}
                <span class="min">${createdAt}</span>
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${body}</p>
                <hr />
                <div class='d-flex gap-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                    </svg>
                    <span class='d-flex gap-2'>
                        (${commentsCount}) comments
                    </span>
                </div>
            </div>

            <div id="comments">
                ${commentsContent}
            </div>

            <div class="input-group mb-3 p-2" id="add-comment-div">
                <input id="comment-input" type='text' class="form-control" placeholder="Add your comment here..." />
                <button class="btn btn-outline-primary" type="button" onClick="createCommentClicked()">Send</button>
            </div>
        </div>
        `;

        postDiv.innerHTML = postContent;
    })
}


document.addEventListener('DOMContentLoaded', function () {
    const onPostDetailsPage = window.location.pathname.includes('postDetails.html');
    if (onPostDetailsPage && urlId) {
        getPost();
    }
});

function createCommentClicked() {
    let commentBody = document.getElementById('comment-input').value;
    let params = {
        "body": commentBody
    }

    let token = localStorage.getItem("token");
    let commentUrl = `${url}/posts/${urlId}/comments`;

    let headers = {
        "authorization": `Bearer ${token}`
    }

    axios.post(commentUrl, params, {
        headers: headers
    })
    .then((response) => {
        // console.log(response);
        showAlert('The comment has been created Successfully', 'success')
        getPost();
    })
    .catch((error) => {
        const errorMessage = error.response.data.message
        showAlert(errorMessage, 'danger')
    })

}



let loginBtn = document.getElementById('login-btn');
let userName = document.getElementById('user-name');
let password = document.getElementById('password');
let loginModel = document.getElementById('loginModel');
let navRegisterBtn = document.getElementById('navRegisterBtn');
let navLoginBtn = document.getElementById('navLoginBtn');
let navLogOutBtn = document.getElementById('navLogOutBtn');
let logoutDiv = document.querySelector('.logout-div');
let registerBtn = document.getElementById('register-btn');
let registerNameInput = document.getElementById('register-name');
let registerUserNameInput = document.getElementById('register-user-name');
let registerPasswordInput = document.getElementById('register-password');
let addBtn = document.getElementById('add-btn');
let addModel = document.getElementById('addModel');
let createBtn = document.getElementById('create-btn');
let postPhoto = document.getElementById('post-photo');
let postBodyInput = document.getElementById('post-body-input');
let postTitle = document.getElementById('post-title');
let userLoggedName = document.getElementById('user-logged-name');
let registerImg = document.getElementById('register-img');
let userImgRegister = document.querySelector('.user-img');

function loginBtnClicked() {
    toggleLoader(true);
    const passwordValue = password.value;
    const userNameValue = userName.value;
    // console.log(passwordValue, userNameValue);

    const params = {
        "username": userNameValue,
        "password": passwordValue
    };

    axios.post(`${url}/login`, params)
    .then((response) => {
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        const modelInstance = bootstrap.Modal.getInstance(loginModel);
        modelInstance.hide();
        showAlert('User logged in successfully', 'success');
        setUpUI();
        // console.log(response.data.token);
    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger')
    }).finally(() => {
        toggleLoader(false);
    });
};


function registerBtnClicked() {
    toggleLoader(true);
    const userValue = registerNameInput.value;
    const userNameValue = registerUserNameInput.value;
    const userPasswordValue = registerPasswordInput.value;
    const userImage = registerImg.files[0];

    let formData = new FormData();
    formData.append("name", userValue);
    formData.append("image", userImage);
    formData.append("username",userNameValue);
    formData.append("password", userPasswordValue)

    const headers = {
        "Content-Type": "multipart/form-data",
    };

    console.log(userNameValue, userValue, userPasswordValue, userImage);

    axios.post(`${url}/register`, formData, {
        headers: headers
    })
    .then((response) => {
        console.log(response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const modal = document.getElementById('registerModel');
        const modelInstance = bootstrap.Modal.getInstance(modal);
        modelInstance.hide();
        showAlert('New User Registered Successfully', 'info');
        setUpUI();
    }).catch((error) => {
        const message = error.response.data.message;
        showAlert(message, 'danger')
    }).finally(() => {
        toggleLoader(false);
    })

}


function addBtnClicked() {
    let postId = postIdInpute.value;
    let isCreate = postId == null || postId == '';
    // alert(isCreate)
    const photo = postPhoto.files;
    const title = postTitle.value;
    const body = postBodyInput.value;
    const token = localStorage.getItem("token");

    

    let formData = new FormData();

    formData.append("body", body);
    formData.append("title",title);

    if (photo.length > 0) {
        formData.append("image", photo[0]);
    }

    const headers = {
        "Content-Type": "multipart/form-data",
        "authorization": `Bearer ${token}`
    };
    let urlLink = ``

    if (isCreate) {
        urlLink = `${url}/posts`;
    } else {
        formData.append("_method", "put");
        urlLink = `${url}/posts/${postId}`;
    }
    toggleLoader(true);
    axios.post(urlLink, formData, {
        headers: headers
        })
        .then((response) => {
            console.log(response);
            const modal = addModel;
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            showAlert('Post Has Been Updated Successfully', 'success');
            getPosts();
        })
        .catch((error) => {
            const message = error.response.data.message;
            showAlert(message, 'danger');
        })
        .finally(() => {
        toggleLoader(false);
    })
}

function logOutFun() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('User logged out successfully', 'success');
    setUpUI();
};

function setUpUI() {
    const token = localStorage.getItem("token");

    if (token == null) {
        navLoginBtn.classList.remove('hidden');
        navRegisterBtn.classList.remove('hidden');
        // navLogOutBtn.classList.add('hidden');
        logoutDiv.classList.add('hidden');
        if (addBtn != null) {
            addBtn.classList.add('d-none');
        }
        

    } else {
        navLoginBtn.classList.add('hidden');
        navRegisterBtn.classList.add('hidden');
        // navLogOutBtn.classList.remove('hidden');
        logoutDiv.classList.remove('hidden');

        if (addBtn != null) {
            addBtn.classList.remove('d-none');
        }
        
        const user = getCurrentUser();
        userLoggedName.innerHTML = user.username;
        userImgRegister.src = user.profile_image;
    }
};


function getCurrentUser() {
    let user = null;
    const storageUser = localStorage.getItem("user");
    
    if (storageUser != null) {
        user = JSON.parse(storageUser);
    }

    return user;
}



function showAlert(messagetoShow, pattern='success') {
    const alertPlaceholder = document.getElementById('alert-success')
    const alert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
    }

    alert(messagetoShow, pattern);
    
    setTimeout(() => {
        const alertHide = bootstrap.Alert.getOrCreateInstance('#alert-success');
        alertPlaceholder.classList.add('fade')
        alertPlaceholder.innerHTML = '';
    }, 3000);
    
};

function getCurrentUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('userid');
    return id;
}

const userInfos = document.getElementById('user-infos');
const userPostsNameProfile = document.querySelector('.user-posts-name')

function getUser() {
    toggleLoader(true);
    const id = getCurrentUserId();
    console.log('The id now',id);
    axios.get(`${url}/users/${id}`)
    .then((response) => {
        // console.log(response);
        const user = response.data.data;
        // console.log(user);
        let userInfoContent = `
            <div class="col-2 ">
                <img src="${user.profile_image}" alt="Image" id="header-image" class="rounded-circle">
              </div>

              <div class="col-4 d-flex flex-column justify-content-evenly user-details">
                <div class="email user-main-info">
                  ${user.email}
                </div>

                <div class="username user-main-info">
                  ${user.username}
                </div>

                <div class="name user-main-info">
                  ${user.name}
                </div>
              </div>

              <div class="col-4 numbers d-flex flex-column justify-content-evenly">
                <div class="number-info">
                  <span class="">${user.posts_count} </span>
                  Posts
                </div>
                <div class="number-info">
                  <span class="">${user.comments_count} </span>
                  Comments
                </div>
              </div>
        `
        userInfos.innerHTML = userInfoContent;
        userPostsNameProfile.innerHTML = `<span>${user.name}'s</span> Posts`;
    })
    .catch((error) => {
        const message = error.response.data.message
        console.log(message);
    })
    .finally(() => {
        toggleLoader(false);
    })
}

getUser();




const userPostsDiv = document.querySelector('.user-posts-div');

function getUserPosts() {
    toggleLoader(true);
    const id = getCurrentUserId();
    axios.get(`${url}/users/${id}/posts`)
    .then((response) => {
        console.log(response);
        const posts = response.data.data;
        // console.log(response);
        // console.log(posts);

        posts.forEach((post) => {
            // console.log(`This is the post ${post}`);
            let author = post.author.name;
            let profileImage = post.author.profile_image;
            // let imgSrc = post.image;
            let imgSrc = typeof post.image === 'string' ? post.image : (post.image?.url ?? null);

            let createdAt = post.created_at;
            let commentsCount = post.comments_count;
            let tags = post.tags;
            const id = post.id;
            const currentPostTagsId = `posts-tags-${id}`
            // console.log(tags);
            let title = post.title;
            let user = getCurrentUser();
            let isMyPost = user != null && post.author.id == user.id;
            let editButtonContent = ``;
            
            if (isMyPost) {
            editButtonContent = `
                <div class='ms-auto d-flex gap-2'>
                    <button class="btn btn-secondary" onClick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>
                    <button class="btn btn-danger" onClick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>
                </div>
            `;
            } 


            if (title != null) {
                title
            } else {
                title = ''
            }
            let content = `
            
            <div class="card shadow my-2">
                        <div class="card-header d-flex align-items-center gap-1">
                            <img src="${profileImage}" class="profile rounded-circle border border-2" alt="person">
                            <p class="mb-0">${author}</p>
                            ${editButtonContent}
                        </div>
                        
                        <div class="card-body" onClick="postClickedOn(${post.id})">
                            ${imgSrc ? `<img src="${imgSrc}" class="card-img-top w-100" alt="post image">` : ''}
                            <span class="min">${createdAt}</span>
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">${post.body}</p>
                            <hr />
                            <div class='d-flex gap-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                                </svg>
                                <span class='d-flex gap-2'>
                                    (${commentsCount}) comments

                                    <span class='d-flex gap-1' id=${currentPostTagsId}>
                                        
                                    </span>
                                </span>
                                
                            </div>
                        </div>
            </div>
            `;

            userPostsDiv.innerHTML += content;
            postsTags = document.getElementById(currentPostTagsId);
            postsTags.innerHTML = '';

            tags.forEach((tag) => {
                // console.log(tag.name);
                let tagsContent = `<button class='btn btn-sm rounded-5 tag'>${tag.name}</button>`;
                postsTags.innerHTML += tagsContent;
            })
        })
    }).catch((error) => {
        const message = error.response.data.message
        console.log(message);
    })
    .finally(() => {
        toggleLoader(false);
    })

};

getUserPosts();


function profileClicked() {
    const user = getCurrentUser();
    const userId = user.id;
    window.location = `profile.html?userid=${userId}`;
}


function userClickedOnPost(userId) {
    window.location = `profile.html?userid=${userId}`;
}

addBtn.addEventListener('click', () => {
    const postId = postIdInpute.value;
    if (!postId) {
        CreateBtnClickedOn();
    }
});

loginBtn.addEventListener('click', () => {
    loginBtnClicked()
});

registerBtn.addEventListener('click', () => {
    registerBtnClicked();
});

navLogOutBtn.addEventListener('click', () => {
    logOutFun();
});

createBtn.addEventListener('click', () => {
    console.log('Create button clicked');
    addBtnClicked();
});

deleteBtn.addEventListener('click', () => {
    confirmDelete();
})




getPosts();
// getPosts(1, true); // page 1, and clear existing posts


setUpUI();


function toggleLoader(show = true) {
    const loader = document.querySelector('.loader');
    if (show) {
        loader.classList.remove('d-none');
    } else {
        loader.classList.add('d-none');
    }
}
