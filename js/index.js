var image = '';
function selectImage(file) {
    if (!file.files || !file.files[0]) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (evt) {
        var img = document.createElement('img');
        img.style.cssText = 'border:1px solid red;position:fixed'
        img.src = evt.target.result;
        img.onload = function () {
            window.URL.revokeObjectURL(img.src);
        };
        document.body.appendChild(img);
        image = evt.target.result;
    }
    reader.readAsDataURL(file.files[0]);
}

function getPic() {
      var xhr = new XMLHttpRequest();
      xhr.open("get", 'https://tse1-mm.cn.bing.net/th/id/R-C.3d3649e757bbc6eb6ac45ff59d7a5d6b?rik=maGWIhW%2f0eqX6Q&riu=http%3a%2f%2fpicture.ik123.com%2fuploads%2fallimg%2f201118%2f12-20111Q64451.jpg&ehk=GTiEC%2fNXH1X5jaxYbPoJ%2fND1JHRWAVZTmk4fvvcPRUE%3d&risl=&pid=ImgRaw&r=0');
      xhr.responseType = "blob";
      xhr.onload = function() {
    	    var img = document.createElement('img');
    	    img.style.cssText = 'border:1px solid red;position:fixed;z-index:-10'
    	    objectUrl = window.URL.createObjectURL(xhr.response)
    		img.src =  objectUrl;
    		img.onload = function(){
    		  window.URL.revokeObjectURL(img.src);
    		};
    		document.body.appendChild(img);
      };
      xhr.onprogress = function (event) {
    	  pg = document.getElementById('pg');
    	  pg.attributes.max = event.total;
    	   pg.value = event.loaded;
      };
      xhr.send();
}

function test() {
    document.location.href = "./test/factory_test/factory_test.html";
}