import VueGapi from 'vue-gapi'

export default ({ app, router, store }) => {
    app.use(VueGapi, {
                apiKey: 'AIzaSyAtQDpFQtP39ZwgELTJ8ue_JSDcqGn7o5g',
                clientId: '596878713214-51gba9vmee64tua02965bpe5ftup03sv.apps.googleusercontent.com',
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.file'
                })
}