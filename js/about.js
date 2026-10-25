// Helper function to set the text of every element that has the class className 
function setAll(className, value) {
	document.querySelectorAll('.' + className).forEach(function (el) {
		el.innerText = value;
	});
}

// Helper function to turn part/total into a percentage string w/ 2 decimals 
function pct(part, total) {
	return ((part / total) * 100).toFixed(2) + '%';
}


function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// converting raw tweet into Tweet obj 
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	const tweet_count = tweet_array.length
	document.getElementById('numberTweets').innerText = tweet_count;	


	// creating an array of the timestamps of all the tweets 
	const tweet_timestamps = tweet_array.map(t => t.time.getTime()); 
	const date_format = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	// find the earliest & latest tweet timestamp, convert it back to Date  
	document.getElementById('firstDate').innerText =
		new Date(Math.min(...tweet_timestamps)).toLocaleDateString('en-US', date_format);
	document.getElementById('lastDate').innerText =
		new Date(Math.max(...tweet_timestamps)).toLocaleDateString('en-US', date_format);

	// count how many tweets in each category 
	const count = src => tweet_array.filter(t => t.source === src).length;
	const completed = count('completed_event');
	const live = count('live_event');
	const achievements = count('achievement');
	const misc = count('miscellaneous');
	
	// Calculating the percentages & setting the count span 
	setAll('completedEvents', completed);
	setAll('completedEventsPct', pct(completed, tweet_count));
	setAll('liveEvents', live);
	setAll('liveEventsPct', pct(live, tweet_count));
	setAll('achievements', achievements);
	setAll('achievementsPct', pct(achievements, tweet_count));
	setAll('miscellaneous', misc);
	setAll('miscellaneousPct', pct(misc, tweet_count));

	// written text (denominator = completed events only)
	const written = tweet_array.filter(t => t.source === 'completed_event' && t.written).length;
	setAll('written', written);
	setAll('writtenPct', pct(written, completed));

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});