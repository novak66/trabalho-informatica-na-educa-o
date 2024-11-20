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
      class="flex justify-between flex-wrap p-10"
      style="min-height: 70%; background-color: rgb(217, 217, 217)"
    >
      <div
        v-for="(c, index) in cartas"
        :key="c.id"
        class="bg-black w-1/12 flex items-center justify-center p-5"
        style="min-height: 70px; margin: 10px 35px 35px 10px"
        :class="['card', { 'is-flipped': c.virado }]"
        :style="{ cursor: c.virado ? 'default' : 'pointer' }"
        @click="virarCarta(index)"
      >
        <p v-if="c.virado" class="p-5 card-face card-back text-white">
          {{ c.text }}
        </p>
        <p></p>
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
      <div class="flex gap-4">
        <div style="width: 100%">
          <meu-input label="Nome do usuario" v-model="usuario"></meu-input>
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
      usuario: null,
      db: null,
      cartas: [
        { id: 0, grupoId: 0, text: "pergunta número 1", virado: false },
        { id: 1, grupoId: 0, text: "Resposta 1", virado: false },
        { id: 2, grupoId: 1, text: "pergunta número 2", virado: false },
        { id: 3, grupoId: 1, text: "Resposta 2", virado: false },
        { id: 4, grupoId: 2, text: "pergunta número 3", virado: false },
        { id: 5, grupoId: 2, text: "Resposta 3", virado: false },
        { id: 6, grupoId: 3, text: "pergunta número 4", virado: false },
        { id: 7, grupoId: 3, text: "Resposta 4", virado: false },
        { id: 8, grupoId: 4, text: "pergunta número 5", virado: false },
        { id: 9, grupoId: 4, text: "Resposta 5", virado: false },
        { id: 10, grupoId: 5, text: "pergunta número 6", virado: false },
        { id: 11, grupoId: 5, text: "Resposta 6", virado: false },
        { id: 12, grupoId: 6, text: "pergunta número 7", virado: false },
        { id: 13, grupoId: 6, text: "Resposta 7", virado: false },
        { id: 14, grupoId: 7, text: "pergunta número 8", virado: false },
        { id: 15, grupoId: 7, text: "Resposta 8", virado: false },
      ],
    };
  },

  components: {
    MeuModal,
    MeuInput,
  },

  name: "Jogo",

  created() {
    this.embaralharCartas();
    this.carregarBanco();
  },

  watch: {
    nomeUsuario() {
      setInterval(() => {
        this.tempo++;
      }, 1000);
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
    },

    async adicionarScore() {
      const stmt = this.db.prepare(`
        INSERT INTO score (nomeJogador, score, tempo) VALUES (?, ?, ?)
      `);
      stmt.run([this.nomeUsuario, this.pontos, this.tempo]);
      stmt.free();

      this.salvarBanco();
    },

    salvarBanco() {
      if (!this.db) {
        console.error("Banco não inicializado.");
        return;
      }

      const data = this.db.export();

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
      localStorage.setItem("meuBanco", base64Data);

      console.log("Banco salvo no LocalStorage!");
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
