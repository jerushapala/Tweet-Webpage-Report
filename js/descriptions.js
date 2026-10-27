function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// turning each runkeeper_tweet into a Tweet object, then filtering out tweet.written for each Tweet obj 
	tweet_array = runkeeper_tweets.map(function(tweet) {return new Tweet(tweet.text, tweet.created_at); })
								.filter(function(tweet) {return tweet.written; }); 

}

// Helper function which updates the search results based on the text
// entered in the search box 
function updateSearchResults(){
	const search_text = document.getElementById('textFilter').value;

	// empty box means no matches
	let match_table = []
	if (search_text !== '') {
		const key_search_words = search_text.toLowerCase(); 
		// filter out the tweets whose written text includes the key search words 
		match_table = tweet_array.filter(function(tweet) {
			return tweet.writtenText.toLowerCase().includes(key_search_words);
		});
	}

	// get the # of matches & searchText 
	document.getElementById('searchCount').textContent = String(match_table.length);
	document.getElementById('searchText').textContent = search_text;

	// Restart row numbers at 1 on every search 
	document.getElementById('tweetTable').innerHTML = match_table
		.map(function(tweet, i) { return tweet.getHTMLTableRow(i + 1); })
		.join('');
}

// Searches the written tweets as text is entered into the search box and adds them to the table 
function addEventHandlerForSearch() {
	document.getElementById('textFilter').addEventListener('input', updateSearchResults);
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});