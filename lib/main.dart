import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const MyHomePage(title: '플러터 데모 홈페이지'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int counter = 0;

  void _incrementCounter() {
    setState(() {
      counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: buildBody2(),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: '증가',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget buildBody() {
    return Center(
      child: Container(
        padding: const EdgeInsets.only(left: 20, right: 20),
        width: 200,
        height: 50,
        color: Colors.blue,
        child: Center(child: Text('container')),
      ),
    );
  }

  Widget buildBody2() {
    return Container(
      padding: const EdgeInsets.only(left: 20, right: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color.fromARGB(255, 255, 59, 98),
            Color.fromARGB(200, 200, 0, 30),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(255, 255, 59, 98).withOpacity(0.5),
            spreadRadius: 5,
            blurRadius: 7,
            offset: Offset(0, 3),
          ),
        ],
      ),
      width: 200,
      height: 150,
      child: Center(
        child: Text('Container', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}
