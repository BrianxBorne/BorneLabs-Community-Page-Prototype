// Your Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('sign-in-btn');
const signOutBtn = document.getElementById('sign-out-btn');
const postSection = document.getElementById('post-section');
const submitPostBtn = document.getElementById('submit-post');
const postsDiv = document.getElementById('posts');

// Authentication
signInBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            postSection.style.display = 'block';
            signInBtn.style.display = 'none';
            signOutBtn.style.display = 'block';
        })
        .catch((error) => {
            console.error('Error signing in:', error);
        });
});

signOutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        postSection.style.display = 'none';
        signInBtn.style.display = 'block';
        signOutBtn.style.display = 'none';
    });
});

// Posting
submitPostBtn.addEventListener('click', () => {
    const postContent = document.getElementById('post-content').value;
    if (postContent) {
        const postId = Date.now(); // Unique ID for each post
        database.ref('posts/' + postId).set({
            content: postContent,
            comments: []
        });
        document.getElementById('post-content').value = '';
    }
});

// Display Posts
database.ref('posts').on('value', (snapshot) => {
    postsDiv.innerHTML = ''; // Clear existing posts
    snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <p>${post.content}</p>
            <h3>Comments</h3>
            <div id="comments-${childSnapshot.key}"></div>
            <input type="text" id="comment-${childSnapshot.key}" placeholder="Your comment" required>
            <button onclick="submitComment('${childSnapshot.key}')">Comment</button>
        `;
        postsDiv.appendChild(postElement);
        displayComments(childSnapshot.key);
    });
});

// Function to display comments for each post
function displayComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    database.ref(`posts/${postId}/comments`).on('value', (snapshot) => {
        commentsDiv.innerHTML = ''; // Clear existing comments
        snapshot.forEach((commentSnapshot) => {
            const comment = commentSnapshot.val();
            const commentElement = document.createElement('p');
            commentElement.textContent = `${comment.username}: ${comment.content}`;
            commentsDiv.appendChild(commentElement);
        });
    });
}

// Function to submit a comment
function submitComment(postId) {
    const commentInput = document.getElementById(`comment-${postId}`);
    const commentContent = commentInput.value;
    const username = prompt("Enter your username:");
    
    if (commentContent && username) {
        database.ref(`posts/${postId}/comments`).push({
            content: commentContent,
            username: username
        });
        commentInput.value = '';
    }
}
