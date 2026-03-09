<template>
  <ConfigProvider>
    <Layout />
  </ConfigProvider>
</template>

<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ConfigProvider from '../../../src/components/config-provider'

const Layout = DefaultTheme.Layout
</script>
