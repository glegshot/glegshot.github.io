const mockData = [
    { title: 'Caching Integers', url: 'java/j1' },
    { title: 'Curious Case of Widening', url: 'java/j2' },
    { title: 'String Allocations', url: 'java/j3' },
    { title: 'String Allocations', url: 'java/j3' },
    { title: 'String Allocations', url: 'java/j3' },
    { title: 'String Allocations', url: 'java/j3' }
];

const BASE_URL = "https://glegshot.github.io/programmingdiaries/post?note=";

$(document).ready(function() {
        const searchInput = $('#searchInput');
        const searchResults = $('#searchResults');
        // Event listener for input change
        searchInput.on('input', processSearchInput);
});

const processSearchInput = debounce(async () => {
    const searchInput = $('#searchInput');
    const query = searchInput.val();
    if(query && query !== '') {
        const results = await fetchData(query);
        displaySearchResults(results);
    } else {
        hideSearchResults();
    }
});


// Function to debounce API calls
function debounce(func, delay = 2000){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, delay);
    };
}


// Function to fetch Data From Server
async function fetchData(query) {
    console.log("invoking API for ", query);
    console.log("returning mock data");
    return mockData;
    // try {
    //     const response = await fetch(`https://api.example.com/search?q=${query}`);
    //     const data = await response.json();
    //     return data;
    // } catch (error) {
    //     console.error('Error fetching data:', error);
    //     return [];
    // }
}

function displaySearchResults(results) {
    searchResults.innerHTML = '';
    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.textContent = result.title;
        resultElement.classList.add('searchResultItem');
        resultElement.addEventListener('click', function() {
            // Handle click event
            console.log('Clicked:', result.title);
            onItemClick(result);
            hideSearchResults(); // Close search results on click
        });
        searchResults.appendChild(resultElement);
    });
    showSearchResults(); // Show search results once dom populated
}

function onItemClick(result) {
    // Open URL in the same tab
    url = BASE_URL + result.url
    window.location.href = url;
}


// Function to show search results
function showSearchResults() {
    searchResults.style.display = 'block';
    // Add click event listener to close search results when clicking outside of it
    $(document).on('click', clickOutsideHandler);
}

function hideSearchResults() {
    searchResults.style.display = 'none';
    // Remove click event listener to avoid unnecessary checks
    $(document).off('click', clickOutsideHandler);
}   

// Click event handler for document body
function clickOutsideHandler(event) {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
        // Clicked outside search results and search input, so hide search results
        hideSearchResults();
    }
}

