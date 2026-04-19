<script>
    import { onMount } from "svelte";

    function choose(choices) {
        var index = Math.floor(Math.random() * choices.length);
        return choices[index];
    }

    let text = $state("AjlskjIO")
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

    onMount(() => {
        const interval = setInterval(() => {
            generateText()
        }, 20);

        return () => clearInterval(interval);  
    })

    function generateText(){
        text = "";
        let result = "";

        for(let i = 0; i < 8; i++){
            result += choose(characters);
        }

        text = result;
    }
</script>
<h1>{text}</h1>