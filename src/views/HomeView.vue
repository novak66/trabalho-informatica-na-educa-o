<script setup>
import router from "@/router";
</script>

<template>
  <div
    class="flex flex-col justify-start w-full h-full"
    style="min-height: 100%"
  >
    <div
      class="flex justify-between items-center w-full p-10"
      style="height: 20%; background: rgb(122, 122, 122)"
    >
      <div class="flex-1">
        <p>Tempo: {{ tempo }} segundos</p>
      </div>

      <div class="flex justify-center items-center flex-1">
        <p
          class="bg-white flex justify-center items-center flex-1"
          style="max-width: 65%; height: 40px"
        >
          Escore: {{ pontos }}
        </p>
      </div>
      <div class="flex-1 flex justify-end">
        <div
          class="cursor-pointer bg-black flex justify-center items-center"
          style="
            border-radius: 50%;
            width: 40px;
            height: 40px;
            color: white;
            font-size: 18px;
          "
          @click="saveGame"
        >
          X
        </div>
      </div>
    </div>
    <div
      class="flex justify-center"
      style="width: 100%; min-height: 70%; background-color: black"
    >
      <div
        class="flex justify-between flex-wrap p-10 text-center"
        style="min-height: 100%; background-color: rgb(217, 217, 217)"
        :style="{
          width: dificuldade == 2 ? '100%' : dificuldade === 1 ? '70%' : '50%',
        }"
      >
        <div
          v-for="(c, index) in cartas"
          :key="c.id"
          class="bg-black flex items-center justify-center p-5"
          style="min-height: 70px; margin: 10px 35px 35px 10px"
          :class="['card', { 'is-flipped': c.virado }]"
          :style="{
            cursor: c.virado ? 'default' : 'pointer',
            width: dificuldade === 2 ? '8%' : dificuldade === 1 ? '11%' : '15%',
          }"
          @click="virarCarta(index)"
        >
          <p
            v-if="c.virado"
            style="font-size: 10px"
            class="p-5 card-face card-back text-white"
          >
            {{ c.text }}
          </p>
          <p v-else class="p-5 text-white">
            {{ c.grupoId }}
          </p>
          <p></p>
        </div>
      </div>
    </div>
    <div
      class="flex justify-center items-center"
      style="height: 10%; background: rgb(122, 122, 122)"
      @click="recomecar"
    >
      <div
        class="bg-white flex justify-center items-center cursor-pointer"
        style="width: 20%; height: 40px"
      >
        Recomeçar
      </div>
    </div>

    <meu-modal
      :isVisible="!nomeUsuario"
      @salvar="create"
      @close="$router.go(-1)"
    >
      <div class="flex flex-col gap-4">
        <div style="width: 100%">
          <meu-input label="Nome do usuario" v-model="usuario"></meu-input>
        </div>
        <div class="flex justify-between">
          <label>
            <input type="radio" :value="0" v-model="dificuldade" /> Fácil
          </label>
          <label>
            <input type="radio" :value="1" v-model="dificuldade" /> Médio
          </label>
          <label>
            <input type="radio" :value="2" v-model="dificuldade" /> Difícil
          </label>
        </div>
      </div>
    </meu-modal>
  </div>
</template>
<script>
import initSqlJs from "sql.js";
import MeuModal from "@/components/modal.vue";
import MeuInput from "@/components/input.vue";
export default {
  data() {
    return {
      tempo: 0,
      pontos: 0,
      nomeUsuario: null,
      usuario: "asd",
      dificuldade: 0,
      db: null,
      cartas: [],
    };
  },

  components: {
    MeuModal,
    MeuInput,
  },

  name: "Jogo",

  async created() {
    await this.carregarBanco();
    this.embaralharCartas();
  },

  watch: {
    nomeUsuario() {
      setInterval(() => {
        this.tempo++;
      }, 1000);
    },

    async dificuldade() {
      this.cartas = [];
      await this.carregarBanco();
      this.embaralharCartas();
    },
  },

  methods: {
    create() {
      this.nomeUsuario = this.usuario;
    },

    embaralharCartas() {
      for (let i = this.cartas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
      }
    },

    saveGame() {
      this.adicionarScore();
      this.$router.go(-1);
    },

    virarCarta(pos) {
      let cartasViradas = this.cartas.filter(
        (item) => item.virado && !item?.acertou
      );

      if (cartasViradas?.length > 1) {
        this.cartas.map((item) => {
          if (!item?.acertou) {
            item.virado = false;
          }
        });
      }

      this.cartas[pos].virado = true;

      cartasViradas = this.cartas.filter(
        (item) => item.virado && !item?.acertou
      );

      if (cartasViradas?.length > 1) {
        if (cartasViradas[0]?.grupoId === cartasViradas[1]?.grupoId) {
          cartasViradas[0].acertou = true;
          cartasViradas[1].acertou = true;

          this.pontos += 10;
        }
      }
    },

    async carregarBanco() {
      const SQL = await initSqlJs({
        locateFile: (file) => `node_modules/sql.js/dist/${file}`,
      });

      const base64Data = localStorage.getItem("meuBanco");

      if (base64Data) {
        const data = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        this.db = new SQL.Database(data);
        console.log("Banco carregado com sucesso!");
      } else {
        console.log("Nenhum banco encontrado, criando novo.");
        this.db = new SQL.Database();
      }

      const allRands = [];
      const tamanho =
        this.dificuldade === 2 ? 8 : this.dificuldade === 1 ? 6 : 4;
      for (let i = 0; i < tamanho; i++) {
        let rand = Math.floor(Math.random() * 23);

        while (allRands.includes(rand)) {
          rand = Math.floor(Math.random() * 23);
        }

        allRands.push(rand);

        const query = `SELECT * FROM cards WHERE grupoId = ?`;
        const stmt = this.db.prepare(query);

        stmt.bind([rand]);

        const results = [];

        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }

        stmt.free();

        if (results.length > 0) {
          this.cartas.push(...results);
        }
      }
    },

    async adicionarScore() {
      const stmt = this.db.prepare(`
        INSERT INTO score (nomeJogador, score, tempo, dificuldade) VALUES (?, ?, ?, ?)
      `);
      stmt.run([this.nomeUsuario, this.pontos, this.tempo, this.dificuldade]);
      stmt.free();

      this.salvarBanco();
    },

    salvarBanco() {
      if (!this.db) {
        return;
      }

      const data = this.db.export();

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
      localStorage.setItem("meuBanco", base64Data);
    },

    recomecar() {
      this.adicionarScore();

      this.pontos = 0;
      this.tempo = 0;
      this.cartas.map((item) => {
        item.virado = false;
        item.acertou = false;
      });
    },
  },
};
</script>

<style>
.card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.card-back {
  transform: rotateY(180deg);
}
</style>
