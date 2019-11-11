import api from "./api";

const Public = {
    antdUpFile: (file, frontend_sts_token, productId, index) => {
        /* console.log('frontend_sts_token', frontend_sts_token);
        console.log('productId', productId);
        console.log('index', index); */
        const imgSize = Public.imgSize("1000");
        return new Promise(
            (resolve, reject) => {
                let name = `${productId}-${index}.jpg`;
                // console.log('name', name);
                let formData = new FormData();

                formData.append('name', name);
                formData.append('key', frontend_sts_token.dir + name);
                formData.append('policy', frontend_sts_token.policy);
                formData.append('OSSAccessKeyId', frontend_sts_token.accessid);
                formData.append('success_action_status', '200');
                // formData.append('callback', frontend_sts_token.callback);
                formData.append('signature', frontend_sts_token.signature);
                formData.append('file', file.file);

                api.axiosPost(frontend_sts_token.host, formData, "formData").then((res) => {
                   
                    const src = api.imgUrl + frontend_sts_token.dir + name + imgSize;
                    resolve({
                        data: {
                            uid: index,
                            key: Math.random() * 100,
                            name: name,
                            status: 'done',
                            url: src,
                        },
                        status: "ok"
                    });
                })
                    .catch(function (error) {
                        reject(error)
                    })
            }
        );
    },
    imgSize: (size) => {
        const sizeList = {
            "50": ["50", "50"],  //0宽、1高
            "1000": ["1000", "1000"],  //0宽、1高
            "200": ["200", "200"],  //0宽、1高
            "160": ["160", "160"],  //0宽、1高
            "130": ["130", "130"],  //0宽、1高
            "290": ["290", "150"],  //0宽、1高
            "55": ["55", "38"],  //0宽、1高
            '420':[420,420],     //0宽、1高
            '840':[840,840],     //0宽、1高
            '80':[80,80],        //0宽、1高

        };
        return `?x-oss-process=image/auto-orient,1/resize,m_lfit,w_${sizeList[size][0]},h_${sizeList[size][1]}/format,png&png=${Math.random()}.png`;
    },
    imgUrl: (merchantsId, goodsId, i = 0, size = 50, dir = 'product') => {
        // return `${api.imgUrl}${dir}/test/${merchantsId}/${goodsId}-${i}.jpg${Public.imgSize(size)}`;
        return `${api.imgUrl}${dir}/${merchantsId}/${goodsId}-${i}.jpg${Public.imgSize(size)}`;
    },
    getProductSign: (dir, id) => {
        // return `${dir}/test/${id}`;
        return `${dir}/${id}`;
    },
    deleteImgDir: (dir) => {
        // return `${dir}/test/`;
        return `${dir}/`;
    },
    // 获取省市区
    getAreas: (that, id = 0, area, tar ) => {
        const data = { parent_id: id };
        api.axiosPost('getAreas', data).then(res => {
            const { data } = res.data;
            if (res.data.code === 1) {
                if (id === 0) {
                    that.setState({
                        [area]: data
                    })
                } else if (id > 0) {
                    if(res.data.data.length>0){
                        tar.loading = false;
                        tar.children = [];
                        data.map((item) => {
                            tar.children.push(item);
                        })
                        that.setState({
                            [area]: [...that.state[area]]
                        })
                    }
                     else {
                        tar.loading = false;
                        tar.isLeaf = true
                        that.setState({
                            [area]: [...that.state[area]],
                        })
                        return
                    }
                   
                }
            }
        })
    },
    //查看附件
    fileLink :(item)=>{
        const data={
            file_name:item
        };
        api.axiosGet("getProductLookSign",data).then((res)=>{
            if(res.status == 200){
                window.open(res.data.url)
            }
        })
    },
    permissions:(path)=>{
        const Jurisdiction = JSON.parse(sessionStorage.getItem("Jurisdiction"));
        let navList = []
        
        Jurisdiction.map((item, index)=>{
            if(path.indexOf(item.path) > -1){
                navList = item.second
            }
        })      
        return navList

    },
    thirdPermissions: (list, path) => {
        let thirdList = {}
        list.map((item, index)=>{
            // console.log('path', path);
            // console.log('item.path', item.path);
            // console.log('item', item);
            if(item.path == path){
                item.three.length && item.three.map(three =>{
                    thirdList[three.id] = three
                })
            }
        })      
        return thirdList
    }
}

export default Public;
