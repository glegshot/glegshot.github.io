$(document).ready(function() {
        const searchInput = $('#searchInput');
        const delay = 2000; // Adjust delay as needed (in milliseconds)

        // Debounced function for fetching data
        const debouncedFetchData = debounce(function(query) {
            fetchData(query);
        }, delay);

        // Event listener for input change
        searchInput.on('input', function() {
            const query = $(this).val();
            if(query)
                debouncedFetchData(query);
        });
    });

function debounce(func, delay) {
        let timerId;
        return function() {
            clearTimeout(timerId);
            timerId = setTimeout(() => func.apply(this, arguments), delay);
        };
    }

    // Function to perform AJAX request
    function fetchData(query) {
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
        console.log("invoking API for ", query);
    }