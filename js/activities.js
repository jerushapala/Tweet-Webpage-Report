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
	  "width": 500, 
	  "height": { "step": 16 }, 
	  "data": {
	    "values": activity_count_data
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {
	      "field": "count",
	      "type": "quantitative",
	      "title": "Number of tweets",
	      "axis": { "orient": "top" }  
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

	// GRAPH #2: Distance by day of the week for the three most-tweeted activities
	
	// array: we filter out the tweets that fall into the top 3 categories & get the distance 
	// then create map: {tweet weekday, activity type, distance covered}
	const distance_data = activity_tweets
		.filter(function(t) {
			// keep only the top three activity types, and only tweets with a real distance
			return top_three.indexOf(t.activityType) !== -1 && t.distance > 0;
		})
		.map(function(t) {
			return {
				"time": t.time,               
				"activity": t.activityType,
				"distance": t.distance         // in miles
			};
		});

	const distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distance by day of the week for the three most tweeted activities.",
	  "width": 400, 
	  "data": {
	    "values": distance_data
	  },
	  "mark": { "type": "point", "opacity": 0.5 },
	  "encoding": {
	    "x": {
	      "field": "time",
	      "timeUnit": "day", 
	      "type": "ordinal",
	      "title": "Day of the week"
	    },
	    "y": {
	      "field": "distance",
	      "type": "quantitative",
	      "title": "Distance (miles)"
	    },
	    "color": {
	      "field": "activity", 
	      "type": "nominal",
	      "title": "Activity type"
	    }
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

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


	// GRAPH #3: Same as Graph #2, except now we're only showing the MEAN distance per day per activity
	const distance_mean_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance by day of the week for the three most tweeted activities.",
	  "width": 400, 
	  "data": {
	    "values": distance_data // same array as Graph #2
	  },
	  "mark": "point",           
	  "encoding": {
	    "x": {
	      "field": "time",
	      "timeUnit": "day",           
	      "type": "ordinal",
	      "title": "Day of the week"
	    },
	    "y": {
	      "aggregate": "mean",           // average distance within each day + activity group
	      "field": "distance",
	      "type": "quantitative",
	      "title": "Mean distance (miles)"
	    },
	    "color": {
	      "field": "activity",          
	      "type": "nominal",
	      "title": "Activity type"
	    }
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_mean_spec, {actions:false});

	// button alternating between the plots 
	const distance_div = document.getElementById('distanceVis');
	const aggregated_div = document.getElementById('distanceVisAggregated');
	const aggregate_button = document.getElementById('aggregate');

	// Start with all points showing and the means hidden
	aggregated_div.style.display = 'none';

	aggregate_button.addEventListener('click', function() {
		if (aggregated_div.style.display === 'none') {
			distance_div.style.display = 'none';
			aggregated_div.style.display = '';
			aggregate_button.textContent = 'Show all activities';
		} else {
			aggregated_div.style.display = 'none';
			distance_div.style.display = '';
			aggregate_button.textContent = 'Show means';
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});