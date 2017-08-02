import _ from "lodash"
import $view from "./lib/view"
import $path from "path"
import {parse} from "../router/lib/view"

export default function($app){
    const {view} = $app.router
    $view(view,$app)
    const {app} = $app
    //404
    app.use(function(req, res, next) {
        let err     =  new Error('Not Found');
        err.status  =  404;
        next(err);
    })
    //配置404以及错误页面
    app.use(function($err,req,res,next){
        const PAGE_ERROR = $app.config("MISS.PAGE_ERROR")
        const errorFile = $path.join("modules",PAGE_ERROR)
        const errorCls = $app.import(errorFile)
        if(!errorFile){
            const err = new Error(lang("mvc.not_find_err_ctrl"))
            return next(err)
        }
        const errorObject = new errorCls()

        errorObject.$server = (function(sFile){
            sFile = sFile ? $path.join("modules",sFile) : $path.join("modules",path,"server")
            const serverFile = $app.import(sFile)
            if(!serverFile){
                return null
            }
            const serverObject = new serverFile()
            serverObject.$store = errorObject.$store
            return serverObject
        })(errorObject.$server)
        _.isFunction(errorObject.created)&&errorObject.created()
        return parse()(req,res)

    })
    //语法报错 from controller
    app.use(function(err,req,res,next){
        res.status(err.status || 504);
        res.setHeader("Content-Type", "text/html")
        res.end("this is a bad request") ;
    })
}