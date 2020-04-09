var express = require('express');
var multer = require('multer');
var fs = require('fs');
let formidable = require('formidable');
var router = express.Router();
const path =require('path');

const md5 = require('blueimp-md5')
const {UserModel, familyModel,ChatModel} = require('../db/models')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', multer({ dest:"public/images"}).single("file"), function(req, res) {
  
  console.log(req.file);
  res.send(req.file)
});



let cacheFolder = 'public/images/';//放置路径
router.post('/upImage', function (req, res, next) {
  let userDirPath = cacheFolder + "Img";
  if (!fs.existsSync(userDirPath)) {
      fs.mkdirSync(userDirPath);//创建目录
  }
  let form = new formidable.IncomingForm(); //创建上传表单
  form.encoding = 'utf-8'; //设置编辑
  form.uploadDir = userDirPath; //设置上传目录
  form.keepExtensions = true; //保留后缀
  form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
  form.type = true;
  form.parse(req, function (err, fields, files) {
      if (err) {
          return res.json(err);
      }
      let extName = ''; //后缀名
      switch (files.file.type) {
          case 'image/pjpeg':
              extName = 'jpg';
              break;
          case 'image/jpg':
            extName = 'jpg';
            break;
          case 'image/jpeg':
              extName = 'jpg';
              break;
          case 'image/png':
              extName = 'png';
              break;
          case 'image/x-png':
              extName = 'png';
              break;
      }
      if (extName.length === 0) {
          return res.json({
              msg: '只支持png和jpg格式图片'
          });
      } else {
          let avatarName = '/' + Date.now() + '.' + extName;
          let  imgPath="http://localhost:4000/images/Img"+avatarName
          let newPath = form.uploadDir + avatarName;
          fs.renameSync(files.file.path, newPath); //重命名
          console.log(newPath)
          res.send( imgPath);
         
      }
  });
});

// 创建家族的路由
router.post('/createFamily', function (req, res) {
  // 读取请求参数数据
  const addData= req.body
  const name= addData.name
  // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    // 查询(根据username)
    familyModel.findOne({name}, function (err, user) {
    // 如果user有值(已存在)
    if(user) {
      // 返回提示错误的信息
      res.send({code: 1, msg: '此用户已存在'})
    } else { // 没值(不存在)
      // 保存
      new familyModel(addData).save(function (error, data) {
        console.log(111,data);
        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        // res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
        // 返回包含user的json数据
       // 响应数据中不要携带password
        res.send({code: 0, data})
      })
    }
  })
  // 返回响应数据
})


// 增加子女的路由
router.post('/addPerson', function (req, res) {
  // 读取请求参数数据
  const addData= req.body
  const name= addData.name

  console.log(addData);
  // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    // 查询(根据username)
  UserModel.findOne({name}, function (err, user) {
    // 如果user有值(已存在)
    if(user) {
      // 返回提示错误的信息
      res.send({code: 1, msg: '此用户已存在'})
    } else { // 没值(不存在)
      // 保存
      new UserModel(addData).save(function (error, user) {

        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        // res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
        // 返回包含user的json数据
        const data = addData // 响应数据中不要携带password
        res.send({code: 0, data})
      })
    }
  })
  // 返回响应数据
})

// 主页的路由
router.get('/index', function (req, res) {
  let data={}
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.find({}, "_id img name ",{limit:8},function (err, user) {
    if(user) {
      data.members=user
      res.send({code: 0, data})
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})
// 主页的路由
router.get('/home', function (req, res) {
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  familyModel.find({},function (err, data) {
    console.log(222,data);
    if(data) {
      res.send({code: 0, data})
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})
//search路由
router.get("/search",function (req,res) {
   let keyword=req.query.keyword;
   const reg = new RegExp(keyword, 'i')
   let data={} 
   familyModel.find({$or : [{name :{$regex : reg}},{information :{$regex : reg}}]}, "_id img name",function (err,family) {
  if(family) {
    data.family=family
    UserModel.find({$or : [ {name :{$regex : reg}},{address :{$regex : reg}},{profession :{$regex : reg}} ]},
      "_id img name generations familySize ",
      {sort : { familySize:1 }, limit : 100}, function (err,user) {
    if(user) {
      console.log(user);
     data.person=user
     console.log(data);
     res.send({code: 0, data:data})
    } 
} )
  } 
} )

 
 
})
// more路由
router.get('/more', function (req, res) {
  let id=req.query.data
  console.log(11,id);
  let data=[]
  UserModel.find({family_id:id}, "_id img name familySize generations ",function (err, user) {
    console.log(111,Boolean(user));
    if(user.length>=1) {
    user.sort((a,b)=>a.familySize-b.familySize);
    let maxgener=user[user.length-1].generations;
    for (let index = 1; index <=maxgener; index++) {
      var arr = user.filter(function(elem){
        return elem.generations==index;
    });
      data.push(arr)
    }
   

      res.send({code: 0, data:data})
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
});

router.post('/addWife', function (req, res) {
  console.log("req参数",req.body);
  let data={};
  data.name=req.body.name;
  data.lastName=req.body.lastName;
  data.img=req.body.img;
  data.isGone=req.body.isGone;
  let id=req.body.id
  console.log(data);
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.updateOne({_id:id}, {$set:{wife:data}},function (err, user) {
    if(user) { 
      res.send({code: 0, data: user})
      console.log(user);
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})



// 更新人员数据
router.post('/upData', function (req, res) {
  
  let data=req.body
  console.log(data._id);
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.updateOne({_id:data._id}, data,function (err, user) {
    if(user) { 
      res.send({code: 0, data: user})
      console.log(user);
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})


// 更新家族信息
router.post('/upFamilyData', function (req, res) {
  
  let data=req.body
  console.log(data._id);
 
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  familyModel.updateOne({_id:data._id}, data,function (err, user) {
    if(user) { 
      UserModel.updateMany({family_id:data._id}, {$set:{familyName:data.name}},function (err, user) {
      
      })
      res.send({code: 0, data: user})
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})

router.get('/delete', function (req, res) {
 
  let id=req.query.id
  console.log(111,id);
 let data=[]
 
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.find({_id:id}, "_id family_id",function (err, user) {
    if(user) { 
      let family_one=user[0].family_id
      data.push(user[0]._id);
      console.log(family_one);
      UserModel.find({family_id:family_one}, "father_id _id",function (err, arr) {
        if(arr.length>=1) { 
        getChildren(id,arr)
       
        data.forEach(element => {
          UserModel.deleteOne({_id:element},function(err,one){
            console.log(3333,one);
          })
        });
        res.send({code: 0, msg: '成功删除'})
        } else {// 登陆失败
          res.send({code: 1, msg: '服务异常'})
        }
       
      });
      function getChildren(id, user) {
        for (let item of user) {//循环获取子节点
            if (item.father_id == id) {
              data.push(
                item._id
            ); 
           getChildren(item._id, user)
           
          }      
            }
        }   
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
  })
})
// 个人详情路由
router.get('/detail', function (req, res) {
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
 const id= req.query.id;
 let father_id;
  let datas={myself:"",father:{},sons:[],brother:""};
  UserModel.findOne({_id:id}, function (err, user) {
    if(user) { 
      father_id=user.father_id==0?1996:user.father_id;
      datas.myself=user
      // 找子女
      UserModel.find({ father_id:id},"_id name img familySize", function (err, user) {
        if(user) {
          user.sort((a,b)=>a.familySize-b.familySize);
          datas.sons=user
        //  兄弟姐妹查询
          UserModel.find({father_id:father_id},"_id name img familySize",function (err, user) {
            if(user) { 
              user.sort((a,b)=>a.familySize-b.familySize);
              datas.brother=user
              // 找父亲
              UserModel.findOne({_id:father_id},"_id name img wife", function (err, user) {
                if(user) { 
                  datas.father=user 
                  res.send({code: 0, data: datas})
                } else {// 登陆失败
                  res.send({code: 4, data: datas})
                }
              })
            } else {// 登陆失败
              res.send({code: 3, data: datas})
            }
          })
        } else {// 登陆失败
          res.send({code: 2, data: datas})
        }
      })
    } else {// 登陆失败
      res.send({code: 1, msg: '没找到相关内容'})
    }
  })
 
});

// treeData路由
router.get('/treeData', function (req, res) {
  const id= req.query.id;
  let data=[]
  UserModel.find({family_id:id },"_id img name father_id  generations wife isBoy isGone",function (err, user ) {
    if(user.length>=1) { 
      var parent ={}
      let arr=user
      arr.forEach(element => {
        
         if (element.generations == 1) {//判断是否为顶层节点
          
           parent._id=element._id
           parent.img=element.img
           parent.name=element.name
           parent.wife=element.wife
           parent.isBoy=element.isBoy
           parent.isGone=element.isGone
         }
           
       });
         parent.children = getChildren(parent._id, user);//获取子节点
         data=parent;
         res.send({data:data})
    } else {// 登陆失败
      res.send({code: 1, msg: '服务异常'})
    }
   
  });
  function getChildren(id, user) {
    let childs = new Array();
    for (let arr of user) {//循环获取子节点
        if (arr.father_id == id) {
          childs.push({
            '_id': arr._id,
            'img': arr.img,
            'name': arr.name,
           "wife":arr.wife,
           "isGone":arr.isGone,
           "isBoy":arr.isBoy
        });         
        }
    }   
    for (let child of childs) {//获取子节点的子节点
        let childscopy = getChildren(child._id, user);//递归获取子节点
        if (childscopy.length > 0) {
            child.children = childscopy;
        }
    }
   
    return childs;

    
  }

});

/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msgList', function (req, res) {
  // 获取cookie中的userid
  console.log(req.query.id);
  const userid =req.query.id
  // 查询得到所有user文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
    const users = [] // 数组容器
    let arr=[];
    userDocs.forEach(doc => {

   if (doc._id!=userid) {
    const chat_id = [doc._id,userid].sort().join('_')// from_to或者to_from
    ChatModel.find({chat_id},function(err, user){
      if (user.length>0) {
        arr=user.sort((a,b)=>b.time-a.time)
        let count=arr.filter((item,index)=>{return item.isRead==false&item.from_!=userid}).length
        console.log(count);
        users.push({name:doc.name,img:doc.img,
          count:count,id:doc._id,chat_id:chat_id,messages:arr,
          newestMsg:arr[arr.length-1].content,
          time:arr[arr.length-1].time,create_time:arr[arr.length-1].create_time})
      }
    })
   
   } 
    })


  users.sort((a,b)=>a.time-b.time)
    // const users = userDocs.reduce((users, user) => {
    //   users[user._id] = {username: user.name, img: user.img}
    //   return users
    // } , {})
    /*
    查询userid相关的所有聊天信息
     参数1: 查询条件
     参数2: 过滤条件
     参数3: 回调函数
    */
   
    ChatModel.find({'$or': [{from_: userid}, {to: userid}]}, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({code: 0, data: {users}})
    })
  })
})

/*
修改指定消息为已读
 */
router.post('/readmsg', function (req, res) {
  // 得到请求中的from和to
  console.log(222222222);
  console.log(req.body);
  const {from_,to}= req.body
  /*
  更新数据库中的chat数据
  参数1: 查询条件
  参数2: 更新为指定的数据对象
  参数3: 是否1次更新多条, 默认只更新一条
  参数4: 更新完成的回调函数
   */
  ChatModel.update({from_, to, isRead: false}, {isRead: true}, {multi: true}, function (err, doc) {
    console.log('/readmsg', doc)
    res.send({code: 0, data:to}) // 更新的数量
  })
})



module.exports = router;
