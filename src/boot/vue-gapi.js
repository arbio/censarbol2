import VueGapi from 'vue-gapi'

export default ({ app, router, store }) => {
    app.use(VueGapi, {
                apiKey: 'AIzaSyAtQDpFQtP39ZwgELTJ8ue_JSDcqGn7o5g',
                clientId: '596878713214-id2ucbv5r9996o55kuqlvi6bgovqdv1b.apps.googleusercontent.com',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
                })
}