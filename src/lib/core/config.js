let $config = {}
import _ from "lodash"
import path from "path"

export default function(){
    let [name,config] = arguments
    if(_.isObject(name)){
        return $config = _.assign($config,name)
    }
    const check_name = /^([a-zA-Z]+\/{0,1})+([a-zA-Z]+\.{0,1})+$/.test(name)
    if(!check_name){
        return null
    }
    check_name&&(name = name.replace(/(^\.)|(\.$)/g,""))
    const index = name.indexOf(".")
    key = index > 0 ? name.substr(0,index) : name
    name = index > 0 ? name.substr(index+1) : null
    if(!$config[key]){
        const file = key === "MISS" ? path.resolve("miss.config") : path.resolve($config.MISS.APPLICATION_PATH,key)
        try{
            $config[key] = require(file)
        }catch(e){
            $config[key] = null
            console.log(e)
        }
    }
    let data = $config[key]
    if(!name&&!config){
        return _.clone(data||{})
    }
    const fn = new Function("type","name","config","data",[
        `swicth(type){`
        ,`   case "save":`
        ,`   return data.name = config`
        ,`   case "del":`
        ,`   return delete data.name`
        ,`   case "read":`
        ,`   return data.name`
        ,`}`
    ].join("\n"))
    const safeFn = type => {
        let ret = ""
        try{
            ret = fn(type,name,config,data)
        }catch(e){
            console.log(e)
        }
        return ret
    }
    if(config!==null){
        return safeFn("read")
    }else if(config===null){
        return safeFn("del")
    }else if(name!=="MISS"){
        return safeFn("save")
    }
}