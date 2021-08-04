<template>
    <div class="com-container">
        <div class="com-chart" ref="hot_ref">
        </div>
    </div>
</template>
<script>

export default {
    data(){
        return{
            chartInstance:null,
            allData:null
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
                series:[
                    {
                        type:'pie'
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
            const legendData = this.allData[0].children.map(item=>{
                return item.name
            })
            const seriesData = this.allData[0].children.map(item=>{
                return{
                    name: item.name,
                    value:item.value
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
            const adapterOption = {}
            this.chartInstance.setOption(adapterOption)
        }
    }
}
</script> 

<style lang="less" scoped>
.com-chart{
    width: 1800px;
    height: 900px;
}
</style>