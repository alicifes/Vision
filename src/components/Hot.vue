<template>
    <div class="com-container">
        <div class="com-chart" ref="hot_ref"></div>
        <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef; </span>
        <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
        <span class="cat-name" :style="comStyle">{{catName}}</span>
    </div>
</template>
<script>

export default {
    data(){
        return{
            chartInstance:null,
            allData:null,
            currentIndex:0,    //当前展示的一级分类数据
            titleFontSize:0
        }
    },
    computed:{
        catName(){
            if(!this.allData){
                return ''
            }else{
                return this.allData[this.currentIndex].name
            }
        },
        comStyle(){
            return{
                fontSize:this.titleFontSize+'px'
            }
        }
    },
    destroyed(){

    },mounted(){
        this.initChart()
        this.getData()
        this.screenAdapter()
    },
    methods:{
        //初始化echarts的实例对象
        initChart(){
            this.chartInstance = this.$echarts.init(this.$refs.hot_ref,'chalk')
            const initOption = {
                title:{
                    text:'▎热销商品占比',
                    left:20,
                    top:20
                },
                legend:{
                    top:'15%',
                    icon:'circle'
                },tooltip:{
                    // tooltip 工具提示
                    show:true,
                    formatter:arg=>{
                        const thirdCategory = arg.data.children
                        // 计算出所有三级分类数值的总和
                        let total = 0
                        thirdCategory.forEach(item=>{
                            total += item.value
                        })
                        let retStr = ''
                        thirdCategory.forEach(item=>{
                            retStr +=`
                            ${item.name}:${parseInt(item.value / total*100)+'%'}
                            <br/>
                            `
                        })
                        return retStr
                    }
                },
                series:[
                    {
                        type:'pie',
                        label:{
                            show:false
                        },
                        emphasis:{
                            label:{
                                show:true
                            },
                            labelLine:{
                                show:false
                            }
                        }
                    }
                ]
            }
            this.chartInstance.setOption(initOption)
        },
        async getData(){
            // 获取服务器的数据
            const { data :ret } = await this.$http.get('hotproduct')
            this.allData = ret
            console.log(this.allData);
            this.updataChart()
        },
        updataChart(){
            // 处理图标所需要的数据
            const legendData = this.allData[this.currentIndex].children.map(item=>{
                return item.name
            })
            const seriesData = this.allData[this.currentIndex].children.map(item=>{
                return{
                    name: item.name,
                    value:item.value,
                    children:item.children
                }
            })
            const dataOption = {
                //生成图例的数据
                legend:{
                    data:legendData
                },
                series:[
                    {
                        data:seriesData
                    }
                ]
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter(){
            this.titleFontSize = this.$refs.hot_ref.offsetWidth/100*3.6
            const adapterOption = {
                title:{
                    textStyle:{
                        fontSize:this.titleFontSize,
                        center:['50%','50%']
                    }
                },
                // 设置图例大小
                legend:{
                    itemWidth:this.titleFontSize/2,
                    itemHeight:this.titleFontSize/2,
                    itemGap:this.titleFontSize/2,
                    textStyle:{
                        fontSize:this.titleFontSize/2
                    }
                },
                series:{
                    radius:this.titleFontSize*4.5
                }
            }
            this.chartInstance.setOption(adapterOption)
            this.updataChart()
        },
        toLeft(){
            this.currentIndex--    //更新当前的currentIndex值
            if(this.currentIndex<0){
                this.currentIndex = this.allData.length-1
            }
            this.updataChart()     //更新界面
        },
        toRight(){
            this.currentIndex++
            if(this.currentIndex > this.allData.length -1){
                this.currentIndex =  0
            }
            this.updataChart()
        }
    }
}
</script>

<style lang="less" scoped>
.com-chart{
    width: 1920px;
    height: 1080px;
}
.arr-left{
    position: absolute;
    left: 10%;
    top:50%;
    transform: translateY(-50%);
    cursor: pointer;          //鼠标移动到上面会出现指示
    color: white;
}
.arr-right{
    position: absolute;
    right: 10%;
    top:50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
}
.cat-name {
    position: absolute;
    left: 80%;
    bottom: 20px;
    color: white;
}
</style>