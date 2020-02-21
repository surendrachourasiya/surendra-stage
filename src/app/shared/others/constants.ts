
// Global constant file
export const Constants = Object.freeze({
    url:{
        languageJSON: 'assets/language/',
        getHomePageDetails: 'getHomePage',
        getFeaturedArtistList: 'artist/getFeaturedArtistList',
        getArtistDetailList : 'artist/getArtistDetailList',
        getArtistDetail : 'artist/artistDetail',
        getShowOriginalList: 'shows/getShowOriginalList',
        getCollectionList: 'collection/getCollectionList',
        getCollectionDetails: 'collection/getCollection',
        getCollectionMediaList: 'collection/getCollectionMediaList',
        getCollectionDetailDesc: 'collection/getCollectionDetail',
        getContinueWatchingList: 'user/getUserCountiueWatchingList',
        getContentByArtist: 'artist/getContentByArtist',
        getArtistEpisodeList: 'artist/artistEpisodesList',
        getArtistShowList: 'artist/artistShowsList',
        getArtistCollectionList: 'artist/artistCollectionList',
        getIndividualEpisodeContent: 'episode/getIndividualContentExclusive',
        getExclusiveShowDetail: 'shows/getShowExclusiveSection',
        getShowDetails: 'shows/getShowDetails',
        getShowEpisodeList: 'shows/getShowEpisodeList',
        getSearchList: 'search/srch',
        getSimilarContent: 'episode/similarContent',
        artistEpisodesList: 'artist/artistEpisodesList',
        similarArtistList: 'artist/similarArtistList',
        episodeFeedContent: 'episode/feedContent',
        exitContentConsumption: 'user/exitContentConsumption',
        settings : 'staticContent/pages',
        getUserDetail: 'user/userDetail',
        verifyOTP: 'user/verifyOtp',
        generateOTP: 'auth/generateOtp',
        userGetOtp: 'user/otp',
        countUpdateCollectionPheripheral: 'collection/updateCollectionPeripheralViews',
        countUpdateShowPheripheral: 'shows/updateShowPeripheralViews',
        countUpdatEpisode: 'episode/updateEpisodeViews',
        saveEntity: 'user/saveEntity',
        homePage: 'homePageV2',
        updateStoryView: 'artist/updateStoryViews',
        getFeedSearchEpisodeList: 'search/srchEpisodeList'
    },
    image:{
        hls: '/HLS/',

        artistSmall:'/44/',
        artistMedium:'/60/',
        artistLarge100:'/100/',
        artistLarge200:'/200/',

        verticalSmall : '/vertical/small/',
        verticalMedium : '/vertical/large/',
        verticalOriginal: '/vertical/',

        horizontalSmall : '/horizontal/small/',
        horizontalMedium : '/horizontal/medium/',
        horizontalLarge: '/horizontal/large/',

        squareSmall : '/square/small/',
        squareMedium : '/square/medium/',       
        squareLarge : '/square/large/',
        square: '/square/',        
    },
    msg:{
        en:{
            internetConnectionLost: 'Unable to connect to the Stage servers right now',
            retryText: 'Retry',
            backToOffline: 'You are offline',
            backToOnline: 'Back to Online',
            logoutSuccessfull: 'Logged out successfully',
            loginSuccesfull: 'Logged-in successfully'
        },
        hin:{
            internetConnectionLost: "कृपया अपना इंटरनेट कनेक्शन जाँच ले।",
            retryText: "रीट्राइ",
            backToOffline: "आप ऑफलाइन हैं।",
            backToOnline: "अब आप ऑनलाइन हैं।",
            logoutSuccessfull: "लोग-आउट सफल।",
            loginSuccesfull: "लोग-इन सफल।"
        }
    }

    
})

