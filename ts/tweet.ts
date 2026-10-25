class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        // DONE 
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const t = this.text; 
        if (t.startsWith('Just completed') || t.startsWith('Just posted')){
            return 'completed_event'; 
        }
        if (t.startsWith('Just completed') || t.startsWith('Just posted')){
            return 'completed_event'; 
        }
        if (t.startsWith('Achieved a new personal record') || t.startsWith('I just set a goal')){
            return 'completed_event'; 
        }

        return "miscellaneous";
    }

    // Returns what the person typed or returns "" if the tweet is 
    // is just the default wording 
    private get userText():string {
        // only completed-event tweets can have written text
        if (this.source != 'completed_event'){
            return ""; 
        }

        const stripped = this.text
            .replace(/https?:\/\/\S+/g, '')   // get rid of links
            .replace(/#Runkeeper/gi, '')      // get rid of hashtags 
            .trim();                         // get rid of extra whitespaces

        // usually user text is added just after a dash, so find the the dash's index
        const dash_index = stripped.indexOf(' - ');
        if (dash_index === -1) {
            return "";                        // "...with @Runkeeper. Check it out!" or "run -"
        }

        // collect the text after the dash (the user text)
        const custom_user_text = stripped.substring(dash_index + 3).trim();
        // this is the default, not written by the user 
        if (custom_user_text === 'TomTom MySports Watch') {
            return "";
        }
        return custom_user_text;
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.userText.length > 0;
    }

    get writtenText():string {
        // returns this.userText (get userText() does the parsing for us)
        return this.userText; 
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}