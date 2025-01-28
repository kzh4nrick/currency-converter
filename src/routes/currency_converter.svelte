<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    let currency1: string = "USD",
        currency2: string = "PHP";
    let amount1: number = 1,
        amount2: number = 1;
    let rates1: { [key: string]: number } = {};
    let rates2: { [key: string]: number } = {};
    let isDropdown1Open = false,
        isDropdown2Open = false;
    let search1 = "",
        search2 = "";
    let isCurrency = true,
        initialRun = true,
        mounted = false;

    onMount(async () => {
        if (typeof window !== "undefined") {
            mounted = true;
            document.addEventListener("click", closeDropdown);
        }
        await fetchRates();
        initialRun = false;
    });

    onDestroy(() => {
        if (mounted) document.removeEventListener("click", closeDropdown);
    });

    //Get rates by currency
    async function fetchRates() {
        try {
            if (isCurrency) {
                const API_URL = `https://api.exchangerate-api.com/v4/latest/${currency1}`;
                const res = await fetch(API_URL);
                const data = await res.json();
                rates1 = data.rates;
                convertCurrency1();
            }
            if (!isCurrency || initialRun) {
                const API_URL = `https://api.exchangerate-api.com/v4/latest/${currency2}`;
                const res = await fetch(API_URL);
                const data = await res.json();
                rates2 = data.rates;
                convertCurrency2();
            }
        } catch (error) {
            console.error("Error fetching rates: ", error);
        }
    }

    // Generate country flag URL from currency code
    function getFlagUrl(currency: string): string | null {
        const nonCountryCurrencies = ["ANG", "XAF", "XCD", "XDR", "XOF", "XPF"];
        if (nonCountryCurrencies.includes(currency)) return null;

        let countryCode = currency.slice(0, 2).toLowerCase(); // Extract first 2 letters
        if (currency === "EUR") countryCode = "eu"; // Euro
        if (currency === "GBP") countryCode = "gb"; // British Pound

        return `https://flagcdn.com/16x12/${countryCode}.png`;
    }

    //Convert 1st currency
    function convertCurrency1() {
        if (rates1[currency2])
            amount2 = parseFloat((amount1 * rates1[currency2]).toFixed(2));
    }

    //Convert 2nd currency
    function convertCurrency2() {
        if (rates2[currency1])
            amount1 = parseFloat((amount2 * rates2[currency1]).toFixed(2));
    }

    //Blur function for the custom dropdowns
    function closeDropdown(event: any) {
        if (mounted) {
            const dropdown = document.getElementById("dropdown1");
            const button = document.getElementById("dropdownBtn1");
            const dropdown2 = document.getElementById("dropdown2");
            const button2 = document.getElementById("dropdownBtn2");
            // Check if the clicked element is outside the dropdown or button
            if (
                dropdown &&
                button &&
                !dropdown.contains(event.target) &&
                !button.contains(event.target)
            ) {
                isDropdown1Open = false;
                search1 = "";
            }
            if (
                dropdown2 &&
                button2 &&
                !dropdown2.contains(event.target) &&
                !button2.contains(event.target)
            ) {
                isDropdown2Open = false;
                search2 = "";
            }
        }
    }
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-100">
    <div
        class="relative mx-2 grid w-full max-w-lg grid-rows-3 items-center gap-y-4 rounded-lg bg-white px-3 pb-9 pt-3 shadow-lg sm:mx-0 sm:px-6 sm:pb-10 sm:pt-6"
    >
        <h1>Currency Converter</h1>
        <!-- 1st Currency -->
        <div class="grid grid-cols-3 gap-2">
            <div class="dropdown font-mono" class:open={isDropdown1Open}>
                <div class="dropdown">
                    <button
                        id="dropdownBtn1"
                        class="flex w-full items-center justify-between rounded border p-2 text-left hover:border-[#f4aeee]"
                        on:click={() => {
                            isDropdown1Open = !isDropdown1Open;
                            isDropdown2Open = false;
                        }}
                    >
                        <span class="flex items-center">
                            {#if getFlagUrl(currency1)}
                                <img
                                    src={getFlagUrl(currency1)}
                                    alt="{currency1} flag"
                                    class="mr-2 inline-block"
                                />
                            {/if}
                            {currency1}
                        </span>
                        <!-- Caret Icon -->
                        <svg
                            class="caret h-5 w-5"
                            class:rotate={isDropdown1Open}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                                fill="#f4aeee"
                                d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
                            /></svg
                        >
                    </button>
                    <div
                        id="dropdown1"
                        class="dropdown-content {isDropdown1Open
                            ? 'block'
                            : 'hidden'}"
                    >
                        <input
                            type="text"
                            class="mb-1 w-full border p-2 text-center hover:border-[#f4aeee] focus:outline-1 focus:outline-offset-1 focus:outline-[#f4aeee]"
                            placeholder="Search..."
                            bind:value={search1}
                        />
                        {#each Object.keys(rates1).filter((currency) => currency
                                .toLowerCase()
                                .includes(search1.toLowerCase())) as currency}
                            <button
                                type="button"
                                class="dropdown-item w-full"
                                on:click={() => {
                                    isCurrency = true;
                                    currency1 = currency;
                                    isDropdown1Open = false;
                                    search1 = "";
                                    fetchRates();
                                }}
                                aria-label={`Select ${currency} as the from currency`}
                            >
                                {#if getFlagUrl(currency)}
                                    <img
                                        src={getFlagUrl(currency)}
                                        alt="{currency} flag"
                                        class="flag"
                                    />
                                {/if}
                                {currency}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- 1st Currency Input/Amount -->
            <div class="col-span-2">
                <input
                    type="number"
                    bind:value={amount1}
                    on:input={convertCurrency1}
                    on:blur={() => {
                        amount1 = amount1 == null ? 1 : amount1;
                        convertCurrency1();
                    }}
                    class="w-full rounded border p-2 font-mono hover:border-[#f4aeee] focus:outline-1 focus:outline-offset-1 focus:outline-[#f4aeee]"
                />
            </div>
        </div>

        <!-- 2nd Currency -->
        <div class="grid grid-cols-3 gap-2">
            <div class="dropdown" class:open={isDropdown2Open}>
                <div class="dropdown font-mono">
                    <button
                        id="dropdownBtn2"
                        class="flex w-full items-center justify-between rounded border p-2 text-left hover:border-[#f4aeee]"
                        on:click={() => {
                            isDropdown2Open = !isDropdown2Open;
                            isDropdown1Open = false;
                        }}
                    >
                        <span class="flex items-center">
                            {#if getFlagUrl(currency2)}
                                <img
                                    src={getFlagUrl(currency2)}
                                    alt="{currency2} flag"
                                    class="mr-2 inline-block"
                                />
                            {/if}
                            {currency2}
                        </span>
                        <!-- Caret Icon -->
                        <svg
                            class="caret h-5 w-5"
                            class:rotate={isDropdown2Open}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                                fill="#f4aeee"
                                d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
                            /></svg
                        >
                    </button>
                    <div
                        id="dropdown2"
                        class="dropdown-content {isDropdown2Open
                            ? 'block'
                            : 'hidden'}"
                    >
                        <input
                            type="text"
                            class="mb-2 w-full border p-2 text-center hover:border-[#f4aeee] focus:outline-1 focus:outline-offset-1 focus:outline-[#f4aeee]"
                            placeholder="Search..."
                            bind:value={search2}
                        />
                        {#each Object.keys(rates2).filter((currency) => currency
                                .toLowerCase()
                                .includes(search2.toLowerCase())) as currency}
                            <button
                                type="button"
                                class="dropdown-item w-full"
                                on:click={() => {
                                    isCurrency = false;
                                    currency2 = currency;
                                    isDropdown2Open = false;
                                    search2 = "";
                                    fetchRates();
                                }}
                                aria-label={`Select ${currency} as the to currency`}
                            >
                                {#if getFlagUrl(currency)}
                                    <img
                                        src={getFlagUrl(currency)}
                                        alt="{currency} flag"
                                        class="flag"
                                    />
                                {/if}
                                {currency}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- 2nd Currency Input/Amount -->
            <div class="col-span-2">
                <input
                    type="number"
                    bind:value={amount2}
                    on:input={convertCurrency2}
                    on:blur={() => {
                        amount2 = amount2 == null ? 1 : amount2;
                        convertCurrency2();
                    }}
                    class="w-full rounded border p-2 font-mono hover:border-[#f4aeee] focus:outline-1 focus:outline-offset-1 focus:outline-[#f4aeee]"
                />
            </div>
        </div>

        <div
            class="absolute bottom-1 right-[6px] font-mono text-xs font-semibold text-gray-500 sm:bottom-1 sm:right-2"
        >
            dev: <span id="credits"
                ><span>K</span><span>ierzhan</span><span>&nbsp;R</span><span
                    >ick</span
                ></span
            >
        </div>
    </div>
</main>

<style>
    h1 {
        text-align: center;
        font-size: 23px;
        font-weight: 900;
        text-transform: uppercase;
        font-family: monseratt, sans-serif;
        background: linear-gradient(
            to right,
            #718096f4 50%,
            #f4aeee 50%,
            #d16ac9
        );
        background-size: 200%;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: 0.8s ease-in-out;
    }
    h1:hover {
        background-position: -100%;
    }
    #credits span {
        cursor: default;
        display: inline-flex;
    }
    #credits span:nth-child(even) {
        color: #db76d3;
        overflow: hidden;
        transition: ease-in-out 0.4s;
        letter-spacing: -1em;
    }
    #credits:hover span:nth-child(even) {
        letter-spacing: 0;
    }
    #credits:hover span:nth-child(2) {
        transition-delay: 0s;
    }
    #credits:hover span:nth-child(4) {
        transition-delay: 0.4s;
    }
    .dropdown {
        position: relative;
        display: inline-block;
        width: 100%;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: white;
        min-width: 100%;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        z-index: 1;
        max-height: 200px;
        overflow-y: auto;
    }

    .dropdown.open .dropdown-content {
        display: block;
    }

    .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .dropdown-item:hover {
        background-color: #f1f1f1;
    }

    .flag {
        margin-right: 10px;
    }

    .caret {
        transition: transform 0.3s ease;
    }

    .caret.rotate {
        transform: rotate(180deg);
    }
</style>
