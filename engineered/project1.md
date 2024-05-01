# GitHub Page Auto-Complete Search

## Overview
The GitHub Page Auto-Complete Search project aims to enhance user experience by implementing an auto-complete feature with prefix-based search functionality for GitHub page websites. This feature allows users to efficiently search for relevant blog topics by providing suggestions as they type.

## Features
- Prefix-based auto-complete search functionality.
- Utilization of a prefix tree to store relevant words across blog topics.
- Integration with an API hosted on AWS serverless Lambda with Java runtime.
- Search against a precomputed inverted index for matching results.
- Return URLs of articles and blogs containing the searched keyword.

## Technologies Used
- Programming Language: Java (server-side), Javascript,Jquery(client side)
- AWS Services: Lambda, API Gateway
- Data Structure: Prefix Tree
- Inverted Index: Precomputed for efficient searching
- Build Tool : Maven (Multi-Module Application)

## Demo 
- https://glegshot.github.io/programmingdiaries/
- Start typing a keyword in the search bar to trigger the auto-complete feature.

## Code Repo
- https://github.com/glegshot/engineered-prefix-search-tree ( Server Side)
- https://github.com/glegshot/glegshot.github.io (Client Side)

## Next Steps
1. Remove the Github content API dependency to avoid Rate limit issue.
2. Add a loader indicator while search API is processing for improved user experience.
3. Avoid on the go load of inverted index which is increasing the response time from server.
4. Implement the search indexer which will be parsing the docs and building a search index and store it in a storage location accesible via web.

