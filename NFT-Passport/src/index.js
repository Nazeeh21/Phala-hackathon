const main = async () => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("http://api.aviationstack.com/v1/flights?access_key=8bd99ce7860afecd6401cbc22cf0c27b", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

main()