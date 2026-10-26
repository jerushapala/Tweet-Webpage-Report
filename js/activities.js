// Returns the average of an array of numbers; 0 for empty array 
function mean(values) {
	if (values.length === 0) {
		return 0;
	}
	return values.reduce(function(sum, v) { return sum + v; }, 0) / values.length;
}


function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});


	// array of the completed tweets we parsed 
	const activity_tweets = tweet_array.filter(function(tweet) {
		return tweet.activityType !== 'unknown';
	});

	// Dictionary of (activityType, tweetCount) 
	const activity_counts = {};
	activity_tweets.forEach(function(tweet) {
		activity_counts[tweet.activityType] = (activity_counts[tweet.activityType] || 0) + 1;
	});


	// GRAPH #1: Number of Tweets Containing Each Type of Activity 
	const activity_count_data = Object.keys(activity_counts).map(function(type) {
		return { "activity": type, "count": activity_counts[type] };
	});
	
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activity_count_data
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {
	      "field": "count",
	      "type": "quantitative",
	      "title": "Number of tweets",
	      "axis": { "orient": "top" }    // move the count axis (labels + title) to the top
	    },
	    "y": {
	      "field": "activity",
	      "type": "nominal",
	      "sort": "-x",
	      "title": "Activity type"
	    }
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});


	// Sort activity types: most-frequent to least freq
	const sorted_types = Object.keys(activity_counts).sort(function(a, b) {
		return activity_counts[b] - activity_counts[a];
	});
	const top_three = sorted_types.slice(0, 3);

	// Calculate the mean distance in miles for the top 3 
	// We skip the activity tweets with no distance 
	const mean_distance = {};
	top_three.forEach(function(type) {
		const distances = activity_tweets
			.filter(function(t) { return t.activityType === type && t.distance > 0; })
			.map(function(t) { return t.distance; });
		mean_distance[type] = mean(distances);
	});

	// Rank the top three by mean distance: first is longest, last is shortest.
	const by_distance = top_three.slice().sort(function(a, b) {
		return mean_distance[b] - mean_distance[a];
	});
	const longest_type = by_distance[0];
	const shortest_type = by_distance[by_distance.length - 1];

	// Weekday vs. weekend for the longest activity type.
	// getDay() returns 0 for Sunday - 6 for Saturday.
	const longest_tweets = activity_tweets.filter(function(t) {
		return t.activityType === longest_type && t.distance > 0;
	});
	const weekend_distances = longest_tweets
		.filter(function(t) { const d = t.time.getDay(); return d === 0 || d === 6; })
		.map(function(t) { return t.distance; });
	const weekday_distances = longest_tweets
		.filter(function(t) { const d = t.time.getDay(); return d >= 1 && d <= 5; })
		.map(function(t) { return t.distance; });
	const longer_on = mean(weekend_distances) > mean(weekday_distances) ? 'weekends' : 'weekdays';

	// Filling in the spans on the page 
	document.getElementById('numberActivities').textContent = String(sorted_types.length);
	document.getElementById('firstMost').textContent = top_three[0];
	document.getElementById('secondMost').textContent = top_three[1];
	document.getElementById('thirdMost').textContent = top_three[2];
	document.getElementById('longestActivityType').textContent = longest_type;
	document.getElementById('shortestActivityType').textContent = shortest_type;
	document.getElementById('weekdayOrWeekendLonger').textContent = longer_on;


	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});