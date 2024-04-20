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
        const searchResults = document.getElementById('searchResults');
        const delay = 2000; // delay in milliseconds

        // Debounced function for fetching data
        //const debouncedFetchData = debounce(function(query) {
        //    fetchData(query);
        //}, delay);

        // Event listener for input change
        searchInput.on('input', function() {
            const query = $(this).val().trim();
            if(query && query !== '') {
                const results = fetchData(query); //debouncedFetchData(query);
                displaySearchResults(results);
            } else {
                hideSearchResults();
            }
        });
});

// Function wrapper to debounce the input event 
function debounce(func, delay, callback) {
        let timerId;
        return function() {
            clearTimeout(timerId);
            timerId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

// Function to perform AJAX request to server
function fetchData(query) {
        console.log("invoking API for ", query);
        console.log("returning mock data");
        return mockData;
        // Perform AJAX request here
        /*$.ajax({
            url: 'your_api_endpoint',
            type: 'GET',
            data: { query: query },
            dataType: 'json',
            success: function(response) {
                // Process the response
                console.log(response);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });*/
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
    showSearchResults(); // Show search results
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
    document.body.addEventListener('click', clickOutsideHandler);
}

function hideSearchResults() {
    searchResults.style.display = 'none';
    // Remove click event listener to avoid unnecessary checks
    document.body.removeEventListener('click', clickOutsideHandler);
}   

// Click event handler for document body
function clickOutsideHandler(event) {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
        // Clicked outside search results and search input, so hide search results
        hideSearchResults();
    }
}

